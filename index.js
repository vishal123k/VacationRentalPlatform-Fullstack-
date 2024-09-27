if(process.env.NODE_ENV !="production"){
    require('dotenv').config();
    }
    
    const express = require("express");
    const app = express();
    const mongoose = require("mongoose");
    const path = require("path");
    const methodOverride = require("method-override");
    const ejsMate = require("ejs-mate");
    const expressError = require("./utils/expressError.js");
    const session = require("express-session");
    const multer = require('multer');
    const MongoStore = require('connect-mongo');
    const flash = require("connect-flash");
    const passport = require("passport");
    const LocalStrategy = require("passport-local");
    const User = require("./models/user.js");
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    
    
    const listingRouter = require("./routers/listing.js");
    const reviewRouter = require("./routers/review.js");
    const userRouter = require("./routers/user.js");
    
    // const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
    
    const dbUrl = process.env.ATLISTDB;


    cloudinary.config({
      CLOUD_NAME : 'domj6hj6j',
      CLOUD_API_KEY : '619654362587413',
      CLOUD_API_SECRET : 'fymBQJU5q66qPKxM1iR3S_YhtCc',
      MAP_TOKEN : 'pk.eyJ1IjoiamFnbHlhbmhpbWFuc2h1IiwiYSI6ImNtMWRsdTJkNjB6cjMyaXNidGwyNzd5d3EifQ.GHZlofUaaiy8FSKvriOuFw',
      ATLISTDB : 'mongodb+srv://vishalk389:5Hln6uYcMiR5Q6q8@cluster0.o06uk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
      SECRET : 'jbjbjghbmjmb',
    });


    
    main()
      .then(() => {
        console.log("connected to DB");
      })
      .catch((err) => {
        console.log(err);
      });
    
    async function main() {
      await mongoose.connect(dbUrl);
    }
    
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride("_method"));
    app.engine("ejs",ejsMate);
    app.use(express.static(path.join(__dirname,"/public")));
    
    

    const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'uploads',
        format: async (req, file) => 'png', // supports promises as well
        public_id: (req, file) => file.originalname
      },
    });

    const upload = multer({ storage: storage });

    app.post('/upload', upload.single('image'), (req, res) => {
      res.send('File uploaded to Cloudinary');
    });



    const store = MongoStore.create({
      mongoUrl: dbUrl,
      crypto: {
        secret:process.env.SECRET,
      },
      touchAfter: 24 * 3600,
    });
    
    store.on("error",()=>{
        console.log("Error in mongo");
    });
    
    const sessionoptions = {
      store,
      secret:process.env.SECRET,
      resave:false,
      saveUninitialized: true,
      cookie:{
      expires: Date.now()+7*24*60*60*1000,
      maxAge: 7*24*60*60*1000,
      httpOnly:true,
      },
    };
    
    app.use(session(sessionoptions));
    app.use(flash());
    
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));
    
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
    
    app.use((req,res,next)=>{
      res.locals.sucess = req.flash("sucess");
      res.locals.error = req.flash("error");
      res.locals.currUser = req.user;
      next();
    });
    
    app.use("/listings",listingRouter);
    app.use("/listings/:id/review", reviewRouter);
    app.use("/",userRouter);
    
    app.all("*",(req,res,next)=>{
      next(new expressError(404,"page not found"));
    });
    
    app.use((err,req,res,next)=>{
      let {status = 500,message} = err;
      res.status(status).render("error.ejs",{message});
    });
    
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
