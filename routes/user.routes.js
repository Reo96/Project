import express from "express";
const router = express.Router();

import {body , validationResult} from 'express-validator';
import bcrypt from 'bcrypt'
import userModel from '../models/user.model.js'
import jwt from 'jsonwebtoken'
router.get('/',(req,res)=>{
    res.render("index");
})
router.get('/register',(req,res)=>{
    res.render('register');
})
router.post('/register', 
    body('email').trim().isEmail(),
    body('password').trim().isLength({min: 5}),
    body('username').trim().isLength({min: 3}),
    async (req, res)=>{
        
            const errors = validationResult(req);
        
            if(!errors.isEmpty()){
               return res.status(400).json({errors: errors.array()});
            }

            const {email,username,password}=req.body;
            const hashPassword = await bcrypt.hash(password,10);
            const user = await userModel.create({
                username:username,
                email:email,
                password:hashPassword
            })
            res.redirect('/user/login');
            console.log(req.body);
})
router.get('/login',(req,res)=>{
    res.render('login');
})
router.post('/login',
    body('username').trim().isLength({min:3}),
    body('password').trim().isLength({min: 5}),
    async (req,res)=>{
        const errors= validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        const {username,password}=req.body;
        const user = await userModel.findOne({
            username:username
        })
        if(!user){
            return res.status(400).json({errors:[{msg:'Invalid username'}]});
        }
        const match = await bcrypt.compare(password, user.password);
        if(!match){
            return res.status(400).json({errors:[{msg:'Invalid password'}]});
        }
        const token = jwt.sign({
            userId:user._id,
            email:user.email,
            username:user.username
        },
        process.env.JWT_SECRET,
        )
        req.session.user = user;
        res.cookie('token',token);
        res.redirect('/drive/files');
})
export default router;