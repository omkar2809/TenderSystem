const express = require('express');
const tenderRouter = express.Router();
const bodyParser = require("body-parser");
const Tender = require("../models/tender");
const AppliedBidder = require('../models/appliedBidder');
const authenticate = require("../util/authenticate");
const cors = require('../util/cors');


tenderRouter.use(bodyParser.json());


tenderRouter.options('*', cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
// query all tender
tenderRouter.get("/", cors.corsWithOptions, (req, res) => {
    // ================== Blockchain func >>>> mainQueryChaincode ================
    // var payload = {
    //     chaincodeName: 'tendersys',
    //     channelName: 'bidchannel',
    //     args: ['TEBDER0'],
    //     peers: ['perr0.gov.tendersys.com'],
    //     fcn: 'queryAllTender'
    // };
    // blockchain.mainQueryChaincode(payload)
    // .then(blockchain_res => {
    //     if(blockchain_res.success) {
    //         res.statusCode = 200;
    //         res.setHeader("Content-Type", "application/json");
    //         res.json(blockchain_res);
    //     }
    //     else {
    //         res.status(500).json(blockchain_res);
    //     }
    // })
    // .catch(err => res.status(500).json({error: 'Something went wrong! please try again'}));

    // ===========================================================================

    // ======================= For Testing ======================================= 
    Tender.find({}).populate('host')
        .then(
            tender => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(tender);
            }
        )
        .catch(err => res.status(500).json({error: 'Something went wrong, please try again!'}));
    // ===========================================================================
});

// query tender
tenderRouter.get('/:tenderId', cors.corsWithOptions, (req, res) => {
    // ================== Blockchain func >>>> mainQueryChaincode ================
    Tender.findById(req.params.tenderId).populate('host').populate('winnerBidder')
        .then(
            tender => {
                if(tender) {
                    // var payload = {
                    //     chaincodeName: 'tendersys',
                    //     channelName: 'bidchannel',
                    //     args: [tender.tenderKey],
                    //     peers: ['perr0.gov.tendersys.com'],
                    //     fcn: 'queryTender'
                    // };
                    // blockchain.mainQueryChaincode(payload)
                    // .then(blockchain_res => {
                    //     if(blockchain_res.success) {
                    //         res.statusCode = 200;
                    //         res.setHeader("Content-Type", "application/json");
                    //         res.json(blockchain_res);
                    //     }
                    //     else {
                    //         res.status(500).json(blockchain_res);
                    //     }
                    // })
                    res.status(200).json(tender);
                }
                else {
                    res.status(404).json({error: 'Tender Not Found'})
                }
            }
        )
        .catch(err => res.status(404).json({error: 'Tender Not Found'}))
    // ===========================================================================

    // ======================= For Testing ======================================= 
    // Tender.findById(req.params.tenderId)
    //     .then(
    //         tender => {
    //         res.statusCode = 200;
    //         res.setHeader("Content-Type", "application/json");
    //         res.json(tender);
    //         }
    //     )
    //     .catch(err => res.status(500).json({error: 'Something went wrong, please try again!'}));
    // ===========================================================================
})

// query tender by owner
tenderRouter.get('/host/:hostId', cors.corsWithOptions, (req, res) => {
    // ================== Blockchain func >>>> mainQueryChaincode ================

    // ===========================================================================

    // ======================= For Testing ======================================= 
    Tender.find({host: req.params.hostId})
        .then(
            tender => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(tender);
            }
        )
        .catch(err => res.status(500).json({error: 'Something went wrong, please try again!'}));
    // ===========================================================================
})

// query tender by owner 
tenderRouter.get('/winnerBidder/:winnerBidderId', cors.corsWithOptions, (req, res) => {
    // ================== Blockchain func >>>> mainQueryChaincode ================

    // ===========================================================================

    // ======================= For Testing ======================================= 
    Tender.find({winnerBidder: req.params.winnerBidderId})
        .then(
            tender => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(tender);
            }
        )
        .catch(err => res.status(500).json({error: 'Something went wrong, please try again!'}));
    // ===========================================================================
})

// invoke tender
tenderRouter.post('/', cors.corsWithOptions, authenticate.verifyGov, (req, res) => {
    // =================== verify req.body ========================
    if(!req.body.tenderKey) {
        res.status(500).json("Tender key Required!!!")
        return;
    }
    if(!req.body.title) {
        res.status(500).json("Title Required!!!")
        return;
    }
    if(!req.body.status) {
        res.status(500).json("Status Required!!!")
        return;
    }
    
    // TODO add more verification steps

    var payload ={
        tenderKey: req.body.tenderKey,
        title: req.body.title,
        host: req.user._id,
        status: req.body.status
    }
    if(req.body.documents) payload.documents = req.body.documents;
    // =============================================================================
    console.log(payload);
    Tender.find({tenderKey: req.body.tenderKey})
        .then(tender => {
            if(tender.length !== 0) {
                res.status(500).json('Tender key already in use!!');
                return;
            } 
            else {
                Tender.create(payload)
                    .then(tender => {
                        // ============== create payload ============================
                        // var payloadForBlockchain = {
                        //     fcn: "createTender",
                        //     peers: ["peer0.bidder.tendersys.com", "peer0.gov.tendersys.com"],
                        //     chaincodeName: "tendersys",
                        //     channelName: "bidchannel",
                        //     args: [
                        //         tender._id,
                        //         req.body.tenderKey,
                        //         req.body.title, 
                        //         "tender",
                        //         req.user.orgName,
                        //         req.body.workDescription,
                        //         req.body.location,
                        //         // TODO add more fields
                        //     ]
                        // }
                        // ==========================================================
                        console.log(tender);
                        // ================== Blockchain func >>>> mainInvokeChaincode ================
                        // blockchain.mainInvokeChaincode(payloadForBlockchain)
                        //     .then(response => {
                        //         console.log(response);
                        //         if(response.success){
                        //             res.status(200).json({blockchain_res:{...response}});
                        //         }else {
                        //             tender.remove()
                        //                 .then(() => {
                        //                     res.status(500).json({
                        //                         blockchain_res: {...response},
                        //                         error: 'Tender not added'
                        //                     });
                        //                 })
                        //         }
                        //     })
                        // ============================================================================
                        res.status(200).json(tender);
                    })
            }
        })
        .catch(err => res.status(500).json({error: 'Something went Wrong!!!'}));
})

// invoke tender
tenderRouter.put('/:tenderId/addWinnerBidder', cors.corsWithOptions, authenticate.verifyGov, (req, res) => {
    if(!req.body.winnerBidderId) {
        res.status(404).json({error: 'Winner Bidder Id required!!'})
        return;
    }
    Tender.findById(req.params.tenderId)
        .then(tender => {
            if(tender) {
                if(tender.host.toString() === req.user._id.toString()) {
                    AppliedBidder.findById(req.body.winnerBidderId)
                    .then(appliedBid => {
                        console.log(appliedBid);
                        if(appliedBid) {
                            // ================= Blockchain Func >>> mainInvokeChaincode =============

                            // =======================================================================

                            tender.winnerBidder = appliedBid._id;
                            tender.save()
                                .then(tender => {
                                    res.status(200).json(tender);
                                })
                        }
                        else{
                            res.status(404).json({error: 'invalid Bidder'});
                        }
                    })
                }
                else {
                    res.status(500).json({error: 'You are not authorized'})
                    return;
                }
            }
            else {
                res.status(404).json({error: 'Tender Not Found'})
                return;
            }
        })
        .catch(err => res.status(500).json({error: 'Something went wrong'}));
})

tenderRouter.post('/:tenderId/applyBid', cors.corsWithOptions, authenticate.verifyBidder, (req, res) => {
    Tender.findById(req.params.tenderId)
        .then(tender => {
            console.log(tender);
            if(tender && tender.status === 'open') {
                if(req.body.bidDetails && req.body.quotation) {
                    var payload = {
                        tender: req.params.tenderId,
                        bidder: req.user._id,
                        bidDetails: req.body.bidDetails,
                        quotation: req.body.quotation
                    };
                    if(req.body.SupportingDocuments) payload.SupportingDocuments = req.body.SupportingDocuments;
                    AppliedBidder.create(payload)
                        .then(appliedTender => {
                            tender.bidCount += 1;
                            tender.save()
                            .then(updatedTender => console.log(updatedTender))
                            res.status(200).json(appliedTender);
                        })
                }
                else {
                    res.status(404).json({error: 'Required fields are missing'});
                }
            }
            else {
                res.status(500).json({error: 'Tender is closed for Bid'});
            }
        })
        .catch(err => res.status(404).json({error: 'Tender not found'}));
})

tenderRouter.get('/:tenderId/getBidders', cors.corsWithOptions, authenticate.verifyGov, (req, res) => {
    Tender.findById(req.params.tenderId)
        .then(tender => {
            if(tender) {
                if(tender.host.toString() === req.user._id.toString()) {
                    AppliedBidder.find({tender: req.params.tenderId})
                        .then(biddersArr => {
                            if(biddersArr.length === 0) res.status(200).json('No Bids');
                            else res.status(200).json(biddersArr);
                        })
                } else {
                    res.status(403).json('You are not authorized')
                }
            } else {
                res.status(404).json('Tender not found')
            }
        })
        .catch(err => res.status(500).json('Something went wrong!!! Please try again'))
})

module.exports = tenderRouter;