require('dotenv').config();
const model = require('../models')
const authenticModel = model.authenticTab;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Validator = require('fastest-validator');
// const { request } = require('http');
// const e = require('express');

//create a sign up
const signUp = async (req, res)=> {
    try {
        const {name, username, email, password} = req.body;

        const data = {
            name: req.body.name,
            username: req.body.username,
            email: req.body.name,
            password: req.body.name
        }

        const validSchema = {
            name: {type: "string", min:5, max:30, optional: false},
            username: {type: "string", min:5, max:30, optional: false},
            email: {type: "string", min:5, max:30, optional: false},
            password: {type: "string", min:3, max:30, optional: false}
        }

        //compare the passed data to the validSchema
        const v = new Validator();
        const validatorResponse = v.validate(data, validSchema);
        if (validatorResponse !== true)
        res.status(401).json({
        status: "Validation Failed",
        errors: validatorResponse[0].message
        })

        //check for email existence
        const checkEmail = await authenticModel.findOne({where: {email: email}});
        const checkUsername = await authenticModel.findOne({where: {username: username}});
        if(checkEmail){
            res.status(401).json({
                status: "Failed",
                message: "Email exist already"
            }) 
        }else if(checkUsername){
                res.status(401).json({
                status: "Failed",
                message: "Username exist already"
            }) 
            }else{
                const saltedPassword = await bcrypt.genSalt(12)
                const hashedPassword = await bcrypt.hash(password, saltedPassword);
            
                    //generate token
                    const generateToken = jwt.sign({
                        name,
                        username,
                        email,
                        password
                    }, process.env.JWT_SECRET, {expiresIn: "6h"});
            
                    const userData = {
                        name,
                        username,
                        email,
                        password: hashedPassword,
                        token: generateToken
                    }

            
                    const newUser = await model.authenticTab.create(userData);
                        res.status(201).json({
                            message: "Registered Successfully",
                            data: newUser
                        })
            }
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}

//log in with email
const logInWithEmail = async (req, res) =>  {
    try{
        const {email, password} = req.body;
        const checkEmail = await authenticModel.findOne({where:{email:email}})
        if(!checkEmail) return res.status(404).json({message:'Unknown Email'})
        const isPassword = await bcrypt.compare(password, checkEmail.password)
        if(!isPassword) return res.status(404).json({message:'Email or password incorrect'})


        const generateToken = await jwt.sign({
            email,
            password,
        }, process.env.JWT_SECRET, {
            expiresIn:'1d'
        })


        checkEmail.token = generateToken 
        await checkEmail.save()
         res.status(201).json({
            message: "Successful",
            data: checkEmail
         })


    }catch(e){
        res.status(400).json({
            message: e.message
        })
    }
}


//log in with username
const logInWithUsername = async (request, response) => {
    try {
        const {username, password} = request.body;
        const isUsername = await authenticModel.findOne({where: {username: username}});
        if (!isUsername)
        response.status(404).json({
            message: "Username Not Found"
        });
        const isPassword = await bcrypt.compare(password, isUsername.password);
        // console.log("data for username", isUsername.password)

        if (!isPassword)
            response.status(401).json({
                message: "Wrong password"
            });

            const generateToken = await jwt.sign({
                username,
                password
            }, process.env.JWT_SECRET, {
                expiresIn: "4h"
            })

            isUsername.token = generateToken
            await isUsername.save();
            response.status(201).json({
                message: "Logged In Successfully",
                data: isUsername
            })
    } catch (error) {
        response.status(401).json({
            message: error.message
        })
    }
};

//read one record from the db
const readOne = async (req, res) => {
    const id = req.params.id;
    try{
        const getOne = await authenticModel.findAll({where: {
            id: id
        }});
        if (getOne.length === 0) {
            res.status(404).json({
                message: "Record with id " + id + "not found"
            })
        } else {
            res.status(200).json({
                message: "Reading record with id " + id,
                data: getOne
            })
        }
    } catch (err) {
        res.status(404).json({
            message: err.message
        })
    }
};

//read all record in the database
const readAll = async (req, res) => {
    try {
        const allRecords = await authenticModel.findAll();
        if (allRecords.length !== 0) {
            res.status(200).json({
                message: "Reading all records",
                data: allRecords
            })
        } else {
            res.status(404).json({
                message: "Record not found"
            })
        }
    } catch(err) {
        res.status(404).json({ 
            message: err.message
        })
    }
}



module.exports = {
    signUp,
    logInWithUsername,
    logInWithEmail,
    readOne,
    readAll
}