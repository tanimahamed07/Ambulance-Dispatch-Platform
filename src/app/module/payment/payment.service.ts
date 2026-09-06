import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { PaymentStatus, TripStatus } from "../../../generated/prisma/enums";
import {
  ICreatePaymentPayload,
  IRetryPaymentPayload,
} from "./payment.interface";
import { getBkashIdToken } from "../../lib/bkash";
import config from "../../config";
import { IRequestUser } from "../auth/auth.interface";
import { transporter } from "../../lib/nodemailer";
import PDFDocument from "pdfkit";

/**
 * Initiate Payment - Create trip payment and get bKash payment URL
 * Similar to bookAppointment - creates payment record and returns payment URL
 */
const initiatePayment = async (
  user: IRequestUser,
  payload: ICreatePaymentPayload,
) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    // Verify caller profile exists
    const caller = await tx.caller.findUnique({
      where: { userId: user.userId },
      include: { user: true },
    });

    if (!caller) {
      throw new AppError(httpStatus.NOT_FOUND, "Caller Profile Not Found");
    }

    // Fetch trip with all relations
    const trip = await tx.trip.findUnique({
      where: { id: payload.tripId },
      include: {
        emergency: {
          include: {
            caller: { include: { user: true } },
          },
        },
        payment: true,
        dispatch: {
          include: {
            ambulance: true,
            driver: { include: { user: true } },
          },
        },
        hospital: true,
      },
    });

    if (!trip) {
      throw new AppError(httpStatus.NOT_FOUND, "Trip Not Found");
    }

    // Verify trip belongs to this caller
    if (trip.emergency.caller.userId !== user.userId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "This Trip Does Not Belong To You",
      );
    }

    // Check trip status - must be completed
    if (trip.status !== TripStatus.COMPLETED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Payment Allowed Only After Trip Completion",
      );
    }

    // Check if fare is calculated
    if (!trip.fare) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Fare Not Calculated For This Trip",
      );
    }

    // Check existing payment status (similar to existingAppointment check)
    if (trip.payment) {
      if (trip.payment.status === PaymentStatus.PENDING) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "You Already Have A Pending Payment. Please Pay For That",
        );
      }

      if (trip.payment.status === PaymentStatus.COMPLETED) {
        throw new AppError(
          httpStatus.CONFLICT,
          "This Trip Is Already Paid For",
        );
      }

      // If FAILED or CANCELLED, allow retry by continuing
    }

    // Prepare payment details
    const amount = Number(trip.fare).toFixed(2);
    const payerReference = caller.user.email || caller.contactNumber;

    if (!payerReference) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "No Contact Information Found For Payment",
      );
    }

    // Get bKash ID token
    const bkashIdToken = await getBkashIdToken();

    if (!bkashIdToken) {
      throw new AppError(
        httpStatus.BAD_GATEWAY,
        "No Bkash Access Token Found!",
      );
    }

    // Call bKash create payment API
    const bkashCreatePaymentResponse = await fetch(
      `${config.bkash_base_url}/tokenized/checkout/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: bkashIdToken,
          "X-App-Key": config.bkash_app_key,
        },
        body: JSON.stringify({
          mode: "0011",
          payerReference: payerReference,
          callbackURL: `${config.bkash_callback_url}/payment/callback`,
          amount: amount,
          currency: "BDT",
          intent: "sale",
          merchantInvoiceNumber: trip.id,
        }),
      },
    );

    const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();

    if (!bkashCreatePaymentResult.paymentID) {
      throw new AppError(
        httpStatus.BAD_GATEWAY,
        "bKash Did Not Return A Payment ID",
      );
    }

    // Create or update payment record in database
    await tx.payment.upsert({
      where: { tripId: trip.id },
      create: {
        tripId: trip.id,
        amount: trip.fare,
        currency: "BDT",
        paymentGateway: "bkash",
        merchantInvoiceNumber: trip.id,
        bkashPaymentID: bkashCreatePaymentResult.paymentID,
        payerReference: payerReference,
        status: PaymentStatus.PENDING,
        paymentCreateTime: new Date(),
      },
      update: {
        bkashPaymentID: bkashCreatePaymentResult.paymentID,
        status: PaymentStatus.PENDING,
        paymentCreateTime: new Date(),
        failureReason: null,
      },
    });

    return {
      paymentUrl: bkashCreatePaymentResult.bkashURL,
    };
  });

  return transactionResult;
};

/**
 * Retry Payment - Retry payment for existing trip with FAILED/CANCELLED payment
 * Similar to payAppointment - creates new payment session for existing trip
 */
const retryPayment = async (
  user: IRequestUser,
  payload: IRetryPaymentPayload,
) => {
  const tripId = payload.tripId;

  // Find trip with payment
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      emergency: {
        include: {
          caller: { include: { user: true } },
        },
      },
      payment: true,
    },
  });

  if (!trip) {
    throw new AppError(httpStatus.NOT_FOUND, "Trip Does Not Exist");
  }

  // Verify ownership
  if (trip.emergency.caller.userId !== user.userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This Trip Does Not Belong To You",
    );
  }

  // Check trip is completed
  if (trip.status !== TripStatus.COMPLETED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Trip Is Not Completed Yet!");
  }

  // Check payment status
  if (!trip.payment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "No Payment Record Found For This Trip",
    );
  }

  if (trip.payment.status === PaymentStatus.COMPLETED) {
    throw new AppError(httpStatus.BAD_REQUEST, "This Trip Is Already Paid For");
  }

  if (trip.payment.status === PaymentStatus.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment Is Already Pending. Please Complete That",
    );
  }

  // Check fare
  if (!trip.fare) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Fare Not Calculated For This Trip",
    );
  }

  const amount = trip.fare.toString();
  const payerReference =
    trip.emergency.caller.user.email || trip.emergency.caller.contactNumber;

  // Get bKash ID token
  const bkashIdToken = await getBkashIdToken();

  if (!bkashIdToken) {
    throw new AppError(httpStatus.BAD_GATEWAY, "No Bkash Access Token Found!");
  }

  // Call bKash create payment API
  const bkashCreatePaymentResponse = await fetch(
    `${config.bkash_base_url}/tokenized/checkout/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: bkashIdToken,
        "X-App-Key": config.bkash_app_key,
      },
      body: JSON.stringify({
        mode: "0011",
        payerReference: payerReference,
        callbackURL: `${config.bkash_callback_url}/payment/callback`,
        amount: amount,
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: trip.id,
      }),
    },
  );

  const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();

  if (!bkashCreatePaymentResult.paymentID) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      "bKash Did Not Return A Payment ID",
    );
  }

  // Update payment record
  await prisma.payment.update({
    where: { tripId: trip.id },
    data: {
      bkashPaymentID: bkashCreatePaymentResult.paymentID,
      merchantInvoiceNumber: bkashCreatePaymentResult.merchantInvoiceNumber,
      status: PaymentStatus.PENDING,
      paymentCreateTime: new Date(),
      failureReason: null,
    },
  });

  return {
    paymentUrl: bkashCreatePaymentResult.bkashURL,
  };
};

/**
 * Payment Callback - Handle bKash payment callback
 * Similar to bookAppointmentCallback - executes payment and sends invoice
 */
const paymentCallback = async (query: Record<string, any>) => {
  const transactionResult = await prisma.$transaction(
    async (tx) => {
      const paymentID = query.paymentID;

      if (!paymentID) {
        throw new AppError(httpStatus.BAD_REQUEST, "Payment ID Missing");
      }

      const status = query.status;

      if (!status) {
        throw new AppError(httpStatus.BAD_REQUEST, "Payment Status Is Missing");
      }

      // Get bKash ID token
      const bkashIdToken = await getBkashIdToken();

      if (!bkashIdToken) {
        throw new AppError(
          httpStatus.BAD_GATEWAY,
          "No Bkash Access Token Found!",
        );
      }

      // Execute payment
      const executedPaymentResponse = await fetch(
        `${config.bkash_base_url}/tokenized/checkout/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: bkashIdToken,
            "X-App-Key": config.bkash_app_key,
          },
          body: JSON.stringify({
            paymentID: paymentID,
          }),
        },
      );

      const executedPaymentResult = await executedPaymentResponse.json();

      // Log the response for debugging
      console.log("bKash Execute Payment Response:", {
        status: executedPaymentResponse.status,
        result: executedPaymentResult,
      });

      // Check if payment execution was successful
      if (
        !executedPaymentResponse.ok ||
        executedPaymentResult.statusCode !== "0000"
      ) {
        console.error("Payment execution failed:", executedPaymentResult);

        // Update payment status to failed
        await tx.payment.update({
          where: { bkashPaymentID: paymentID },
          data: {
            status: PaymentStatus.FAILED,
            failureReason:
              executedPaymentResult.statusMessage || "Payment execution failed",
          },
        });

        return {
          redirectUrl: `${config.frontend_url}/dashboard/my-trips?status=failure`,
        };
      }

      if (status === "success") {
        // Validate executedPaymentResult
        if (
          !executedPaymentResult.merchantInvoiceNumber ||
          !executedPaymentResult.trxID
        ) {
          throw new AppError(
            httpStatus.BAD_GATEWAY,
            "Invalid Payment Response From bKash",
          );
        }

        // Find trip by merchantInvoiceNumber
        const trip = await tx.trip.findUnique({
          where: {
            id: executedPaymentResult.merchantInvoiceNumber,
          },
          include: {
            emergency: {
              include: {
                caller: { include: { user: true } },
              },
            },
            dispatch: {
              include: {
                ambulance: true,
                driver: { include: { user: true } },
              },
            },
            hospital: true,
            payment: true,
          },
        });

        if (!trip) {
          throw new AppError(httpStatus.NOT_FOUND, "Trip Not Found!");
        }

        // Update payment status
        let paymentExecuteTime = new Date();
        if (executedPaymentResult.paymentExecuteTime) {
          const parsedDate = new Date(executedPaymentResult.paymentExecuteTime);
          if (!isNaN(parsedDate.getTime())) {
            paymentExecuteTime = parsedDate;
          }
        }

        await tx.payment.update({
          where: {
            tripId: executedPaymentResult.merchantInvoiceNumber,
          },
          data: {
            status: PaymentStatus.COMPLETED,
            trxID: executedPaymentResult.trxID,
            paymentExecuteTime: paymentExecuteTime,
          },
        });

        // Generate PDF invoice
        const pdfDocument = new PDFDocument({ margin: 50 });
        const pdfChunks: Buffer[] = [];

        pdfDocument.on("data", (chunk: Buffer) => {
          pdfChunks.push(chunk);
        });

        const pdfReadyPromise = new Promise<Buffer>((resolve) => {
          pdfDocument.on("end", () => {
            resolve(Buffer.concat(pdfChunks));
          });
        });

        // PDF Content
        pdfDocument.fontSize(20).text("Ambulance Dispatch System", {
          align: "center",
        });
        pdfDocument.fontSize(14).text("Trip Payment Invoice", {
          align: "center",
        });
        pdfDocument.moveDown(2);

        pdfDocument
          .fontSize(12)
          .text(`Caller Name: ${trip.emergency.caller.user.name}`);
        pdfDocument.text(`Caller Email: ${trip.emergency.caller.user.email}`);
        if (trip.emergency.caller.contactNumber) {
          pdfDocument.text(
            `Caller Phone: ${trip.emergency.caller.contactNumber}`,
          );
        }
        pdfDocument.moveDown();

        pdfDocument.text(`Patient Name: ${trip.emergency.patientName}`);
        pdfDocument.text(`Patient Phone: ${trip.emergency.patientPhone}`);
        pdfDocument.text(`Emergency Type: ${trip.emergency.emergencyType}`);
        pdfDocument.moveDown();

        pdfDocument.text(
          `Ambulance: ${trip.dispatch.ambulance.ambulanceNumber}`,
        );
        pdfDocument.text(`Driver: ${trip.dispatch.driver.user.name}`);
        if (trip.hospital) {
          pdfDocument.text(`Hospital: ${trip.hospital.name}`);
        }
        pdfDocument.moveDown();

        pdfDocument.text(`Pickup Address: ${trip.emergency.pickupAddress}`);
        if (trip.startedAt) {
          pdfDocument.text(`Trip Started: ${trip.startedAt.toLocaleString()}`);
        }
        if (trip.pickedUpAt) {
          pdfDocument.text(
            `Patient Picked Up: ${trip.pickedUpAt.toLocaleString()}`,
          );
        }
        if (trip.hospitalArrivalAt) {
          pdfDocument.text(
            `Arrived at Hospital: ${trip.hospitalArrivalAt.toLocaleString()}`,
          );
        }
        if (trip.completedAt) {
          pdfDocument.text(
            `Trip Completed: ${trip.completedAt.toLocaleString()}`,
          );
        }
        if (trip.distanceKm) {
          pdfDocument.text(`Distance: ${trip.distanceKm} km`);
        }
        pdfDocument.moveDown();

        pdfDocument.text(`Amount Paid: ${executedPaymentResult.amount} BDT`);
        pdfDocument.text(`Payment Method: bKash`);
        pdfDocument.text(`Transaction ID: ${executedPaymentResult.trxID}`);
        pdfDocument.text(
          `Paid At: ${executedPaymentResult.paymentExecuteTime || new Date().toISOString()}`,
        );

        pdfDocument.end();

        const pdfBuffer = await pdfReadyPromise;

        // Send email with invoice
        await transporter.sendMail({
          from: config.email_sender,
          to: trip.emergency.caller.user.email,
          subject: "Your Trip Payment Invoice - Ambulance Dispatch System",
          text: "Thank you for using our service. Please find your invoice attached.",
          attachments: [
            {
              filename: "trip-invoice.pdf",
              content: pdfBuffer,
            },
          ],
        });

        return {
          redirectUrl: `${config.frontend_url}/dashboard/my-trips?status=success`,
        };
      } else if (status === "failure") {
        await tx.payment.update({
          where: {
            bkashPaymentID: paymentID,
          },
          data: {
            status: PaymentStatus.FAILED,
            failureReason:
              executedPaymentResult.statusMessage || "Payment failed",
          },
        });

        return {
          redirectUrl: `${config.frontend_url}/dashboard/my-trips?status=failure`,
        };
      } else if (status === "cancel") {
        await tx.payment.update({
          where: {
            bkashPaymentID: paymentID,
          },
          data: {
            status: PaymentStatus.CANCELLED,
            failureReason: "Payment cancelled by user",
          },
        });

        return {
          redirectUrl: `${config.frontend_url}/dashboard/my-trips?status=cancel`,
        };
      } else {
        return {
          redirectUrl: `${config.frontend_url}/dashboard/my-trips?error=payment-failed`,
        };
      }
    },
    {
      maxWait: 10000,
      timeout: 30000,
    },
  );

  return transactionResult;
};

/**
 * Get My Payment - Get payment details for a specific trip
 */
const getMyPayment = async (user: IRequestUser, tripId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { tripId },
    include: {
      trip: {
        include: {
          emergency: { include: { caller: true } },
          dispatch: {
            include: {
              ambulance: true,
              driver: { include: { user: true } },
            },
          },
          hospital: true,
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "No Payment Found For This Trip");
  }

  if (payment.trip.emergency.caller.userId !== user.userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This Payment Does Not Belong To You",
    );
  }

  return payment;
};

/**
 * Query Payment Status - Sync payment status with bKash
 */
const queryPaymentStatus = async (paymentID: string) => {
  const payment = await prisma.payment.findUnique({
    where: { bkashPaymentID: paymentID },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment Record Not Found");
  }

  // Get bKash ID token
  const bkashIdToken = await getBkashIdToken();

  if (!bkashIdToken) {
    throw new AppError(httpStatus.BAD_GATEWAY, "No Bkash Access Token Found!");
  }

  // Call bKash query payment API
  const bkashQueryPaymentResponse = await fetch(
    `${config.bkash_base_url}/tokenized/checkout/payment/status`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: bkashIdToken,
        "X-App-Key": config.bkash_app_key,
      },
      body: JSON.stringify({
        paymentID: paymentID,
      }),
    },
  );

  if (!bkashQueryPaymentResponse.ok) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      "Failed To Query bKash Payment Status",
    );
  }

  const result = await bkashQueryPaymentResponse.json();

  const status =
    result.transactionStatus === "Completed"
      ? PaymentStatus.COMPLETED
      : result.transactionStatus === "Initiated"
        ? PaymentStatus.PENDING
        : PaymentStatus.CANCELLED;

  return prisma.payment.update({
    where: { id: payment.id },
    data: {
      status,
      trxID: result.trxID,
      failureReason:
        status === PaymentStatus.CANCELLED ? result.transactionStatus : null,
    },
  });
};

export const PaymentService = {
  initiatePayment,
  retryPayment,
  paymentCallback,
  getMyPayment,
  queryPaymentStatus,
};
