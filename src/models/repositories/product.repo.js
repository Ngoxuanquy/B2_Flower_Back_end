const { Types } = require('mongoose')
const { product, clothing, electronic, furniture } = require('../product.model')
const { getSelectData, unGetSelectData, convertToObjectIdMongodb } = require('../../utils')

const queryProduct = async ({ query, limit, skip }) => {
    return await product
        .find(query)
        .populate('product_shop', 'name email -_id',)
        .sort({ updateAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
}

const findAllDraftsForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const findAllPublishForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const searchProductByUser = async ({ keySearch }) => {
    const result = await product
        .find(
            {
                // isPublished: true,
                product_name: { $regex: `.*${keySearch}.*`, $options: 'i' },
            }
        )
        .lean();

    return result;
}


const findAllProducts = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? { _id: -1 } : { id: 1 }
    const products = product.find(filter).sort(sortBy).skip(skip).limit(limit).select(getSelectData(select)).lean()

    return products
}

const findProduct = async ({ product_id, unSelect = ['__v'] }) => {
    return product.findById(product_id).select(unGetSelectData(unSelect))
}

const getProductById = async (productId) => {

    return await product.findOne({ _id: convertToObjectIdMongodb(productId) }).lean()
}

const deleteProductById = async (productId) => {

    console.log(productId.productId)
    // return await product.deleteOne({ _id: convertToObjectIdMongodb(productId) }).lean()
    try {
        const result = await product.deleteOne({ _id: productId.productId }).lean()
        console.log(result); // Optional: Print the result to the console
        return result;
    } catch (error) {
        console.error(error);
        // Handle the error accordingly
    }
}


const getProductAll = async () => {
    try {
        const products = await product.find({}).lean();
        console.log(products);
        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
}

const updateProductById = async ({ productId, bodyUpdate, model, isNew = true }) => {
    return await model.findByIdAndUpdate(productId, bodyUpdate, {
        new: isNew,
    })
}

const publishProductByShop = async ({ product_shop, product_id }) => {

    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
    })

    if (!foundShop) return null

    foundShop.isDraft = false
    foundShop.isPublished = true

    const { modifiedCount } = await foundShop.update(foundShop)

    return modifiedCount
}

const unPublishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
    })

    if (!foundShop) return null

    foundShop.isDraft = true
    foundShop.isPublished = false

    const { modifiedCount } = await foundShop.update(foundShop)

    return modifiedCount
}

module.exports = {
    findAllDraftsForShop,
    findAllPublishForShop,
    publishProductByShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById,
    getProductById,
    getProductAll,
    deleteProductById
}
