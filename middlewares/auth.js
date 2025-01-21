import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
const auth = async (req,res,next) =>{
    const token = req.cookies.token;
    if(!token){
        return res.redirect('/user/login');
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        req.session.user = {
            _id: user._id.toString(),
            name: user.username,
            email: user.email,
            uploads:user.uploads
          };
        return next();
    }
    catch(err){
        return res.redirect('/user/login');
    }
}

export default auth;