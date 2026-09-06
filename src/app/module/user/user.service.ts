import type { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";

const uploadProfileImage = async (buffer: Buffer, userId: string) => {
	// const cloudinaryResult = cloudinary.uploader.upload_stream(
	//     {
	//         resource_type : "auto"
	//     },

	//     async (error, result) => {
	//         if(error){
	//             console.log(error);
	//             throw new Error(error.message)
	//         }

	//         console.log(result, "result");

	//         const updatedUser = await prisma.user.update({
	//             where : {
	//                 id : userId
	//             },

	//             data: {
	//                 imageUrl : result?.secure_url,
	//                 imagePublicId : result?.public_id
	//             }
	//         })

	//         console.log(updatedUser);

	//         // return result
	//     }
	// ).end(buffer)

	const currentUser = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			profilePublicId: true,
			profileUrl: true,
		},
	});

	const cloudinaryResult = await new Promise<UploadApiResponse>(
		(resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "auto",
					},

					async (error, result) => {
						if (error) {
							return reject(error);
						}

						if (!result) {
							return reject(new Error("No result returned from Cloudinary"));
						}

						resolve(result);
					},
				)
				.end(buffer);
		},
	);

	const updatedUser = await prisma.user.update({
		where: {
			id: userId,
		},

		data: {
			profileUrl: cloudinaryResult.secure_url,
			profilePublicId: cloudinaryResult.public_id,
		},

		omit: {
			password: true,
		},
	});

	if (currentUser?.profilePublicId && currentUser.profileUrl) {
		await cloudinary.uploader.destroy(currentUser.profilePublicId);
	}

	return updatedUser;
};

export const UserServices = {
	uploadProfileImage,
};
