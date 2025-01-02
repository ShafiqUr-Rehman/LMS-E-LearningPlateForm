import layoutModel from "../models/layout.model.js";
import ErrorHandler from "../utilis/ErrorHandler.js";
import cloudinary from "cloudinary";

// Create Layout
export const createLayout = async (req, res, next) => {
    try {
        const { type } = req.body;

        if (type === "Banner") {
            const { img, title, subTitle } = req.body;
            const myCloud = await cloudinary.v2.uploader.upload(img, {
                folder: "layout",
            });
            const banner = {
                img: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                },
                title,
                subTitle,
            };
            await layoutModel.create({ type, banner });
        } else if (type === "FAQ") {
            
            const { faq } = req.body;
            if (!Array.isArray(faq)) {
                return next(new ErrorHandler("FAQ must be an array of objects", 400));
            }
            await layoutModel.create({ type, faq });

        } else if (type === "Categories") {

            const { categories } = req.body;
            if (!Array.isArray(categories)) {
                return next(new ErrorHandler("Categories must be an array of objects", 400));
            }
            await layoutModel.create({ type, categories });

        } else {
            return next(new ErrorHandler("Invalid layout type", 400));
        }

        res.status(201).json({
            success: true,
            message: "Layout created successfully!",
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};


// Edit layout
export const editLayout = async (req, res, next) => {
    try {
        const { type, id } = req.body;

        if (!id) {
            return next(new ErrorHandler("Layout ID is required", 400));
        }

        const layout = await layoutModel.findById(id);

        if (!layout) {
            return next(new ErrorHandler("Layout not found", 404));
        }

        if (type === "Banner") {
            const { img, title, subTitle } = req.body;

            if (img) {
                // Remove existing image from Cloudinary
                if (layout.banner?.img?.public_id) {
                    await cloudinary.v2.uploader.destroy(layout.banner.img.public_id);
                }

                // Upload new image to Cloudinary
                const myCloud = await cloudinary.v2.uploader.upload(img, {
                    folder: "layout",
                });

                layout.banner.img = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };
            }

            if (title) layout.banner.title = title;
            if (subTitle) layout.banner.subTitle = subTitle;

        } else if (type === "FAQ") {
            const { faq } = req.body;

            if (!Array.isArray(faq)) {
                return next(new ErrorHandler("FAQ must be an array of objects", 400));
            }

            layout.faq = faq;

        } else if (type === "Categories") {
            const { categories } = req.body;

            if (!Array.isArray(categories)) {
                return next(new ErrorHandler("Categories must be an array of objects", 400));
            }

            layout.categories = categories;

        } else {
            return next(new ErrorHandler("Invalid layout type", 400));
        }

        await layout.save();

        res.status(200).json({
            success: true,
            message: "Layout updated successfully!",
        });

    } catch (error) {
        console.error('Error details:', error);
        return next(new ErrorHandler(error.message, 500));
    }
    
};

// get layout by type

export const getLayoutByType = async (req, res, next) => {
    try {
        const { type } = req.body;
        if (!type) {
            return next(new ErrorHandler("Type parameter is required", 400));
        }
        const layout = await layoutModel.findOne({ type });

        if (!layout) {
            return next(new ErrorHandler(`Layout of type ${type} not found`, 404));
        }

        res.status(200).json({
            success: true,
            data: layout,
        });
    } catch (error) {
        console.error('Error details:', error);
        return next(new ErrorHandler(error.message, 500));
    }
};

