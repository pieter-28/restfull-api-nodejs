import {validate} from "../validation/validation.js";
import {getContactValidation} from "../validation/contact-validation.js";
import {prismaClient} from "../application/database.js";
import {ResponseError} from "../error/response-error.js";
import {
    createAddressValidation, getAddressValidation, updateAddressValidation
} from "../validation/address-validation.js";
import {request} from "express";

const checkContactMustExist = async (user, contactId) => {
    contactId = validate(getContactValidation, contactId);

    const totalContact = await prismaClient.contact.count({
        where: {
            username: user.username, id: contactId
        }
    });

    if (totalContact !== 1) {
        throw new ResponseError(404, "contact is not found");
    }
    return contactId;
}

const create = async (user, contactId, request) => {
    contactId = await checkContactMustExist(user, contactId);

    const address = validate(createAddressValidation, request);
    address.contact_id = contactId;

    return prismaClient.address.create({
        data: address, select: {
            id: true, street: true, city: true, province: true, postal_code: true, country: true
        }
    });
}

const get = async (user, contactId, addressId) => {
    contactId = await checkContactMustExist(user, contactId);
    addressId = validate(getAddressValidation, addressId);

    const address = await prismaClient.address.findFirst({
        where: {
            id: addressId, contact_id: contactId
        }, select: {
            id: true, street: true, city: true, province: true, postal_code: true, country: true
        }
    });

    if (!address) {
        throw new ResponseError(404, "address is not found");
    }
    return address;
}

const update = async (user, contactId, request) => {
    contactId = await checkContactMustExist(user, contactId);
    const address = validate(updateAddressValidation, request);

    const totalAddress = await prismaClient.address.count({
        where: {
            contact_id: contactId, id: address.id
        }
    });

    if (totalAddress !== 1) {
        throw new ResponseError(404, "address is not found");
    }

    return prismaClient.address.update({
        where: {
            id: address.id
        }, data: {
            street: address.street,
            city: address.city,
            province: address.province,
            postal_code: address.postal_code,
            country: address.country
        }, select: {
            id: true, street: true, city: true, province: true, postal_code: true, country: true
        }
    });
}

const remove = async (user, contactId, addressId) => {
    contactId = await checkContactMustExist(user, contactId);
    addressId = validate(getAddressValidation, addressId);

    const totalAddress = await prismaClient.address.count({
        where: {
            contact_id: contactId, id: addressId
        }
    });

    if (totalAddress !== 1) {
        throw new ResponseError(404, "address is not found");
    }

    return prismaClient.address.delete({
        where: {
            id: addressId
        }
    });
}

const list = async (user, contactId) => {
    contactId = await checkContactMustExist(user, contactId);

    return prismaClient.address.findMany({
        where: {
            contact_id: contactId
        }, select: {
            id: true, street: true, city: true, province: true, postal_code: true, country: true
        }
    });
}

export default {
    create, get, update, remove, list
}