var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var licenseSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    issuedBy: {
        type: String,
        required: true
    },
    issuedDate: {
        type: String,
        required: true
    },
    expiryDate: {
        type: String,
        default: 'no expiry'
    },
    url: {
        type: String,
    }
});

var workExpSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    period: {
        type: String,
        required: true
    }
})

var User = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/]
    },
    orgName: {
        type: String,
        default: ''
    },
    orgDescription: {
        type: String,
        default: ''
    },
    workExperience: [ workExpSchema ],
    licenses: [ licenseSchema ],
    // admin:  {
    //     type: Boolean,
    //     default: false
    // },
    role: {
        type: String,
        default: 'Bidder',// Gov Bidder
    },
    blockchainAccess: {
        type: Boolean,
        default: false
    },
    // accessTender: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Tender'
    // }]
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);