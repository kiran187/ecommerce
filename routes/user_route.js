var express = require("express");
var exe = require("./connection");
var url = require("url");
var router = express.Router()
function checklogin(req){

    if(req.session.customer_id)
        return true;
    else
    return false;
}

 router.get("/",async function (req,res){
    var data = await exe ("SELECT * FROM company");
    var kiran = await exe("SELECT * FROM slider");
    var obj = {"company_info":data[0],"slider":kiran,"is_login":checklogin(req)};
    res.render("user/index.ejs",obj);
});

router.get("/about",async function(req,res){
    var data = await exe ("SELECT * FROM company");
    var obj = {"company_info":data[0],"is_login":checklogin(req)};
    res.render("user/about.ejs",obj);
});

router.get("/shop",async function(req,res){

    var url_data = url.parse(req.url,true).query;
    

var category = await exe(`SELECT * FROM category`);
var colors = await exe(`SELECT product_colors FROM product GROUP BY product_colors`);
var companies = await exe (`SELECT product_company FROM product GROUP BY product_company`);
cond = "";
 if(url_data.category_id != undefined) 
 {
    cond = `  WHERE category_id = '${url_data.category_id}' `;
 } 

 if(url_data.colors != undefined) 
    {
       cond = `  WHERE product_colors  = ' ${url_data.colors}' `;
    } 

    if(url_data.companies != undefined) 
        {
           cond = `  WHERE product_companies  = ' ${url_data.companies} ' `;
        } 

       
    
    

        var product = await exe (`SELECT * , (SELECT MIN(product_price)FROM product_pricing WHERE
            product_pricing.product_id = product.product_id AND product_price>0) as price ,
          
            (SELECT MIN(product_duplicate_price)FROM product_pricing WHERE
            product_pricing.product_id = product.product_id AND product_duplicate_price>0) as duplicate_price 
             FROM product `+cond  )
     
    



    var data = await exe (`SELECT * FROM company`);
    var obj = {"company_info":data[0],"category":category,"colors":colors,"companies":companies,"product":product,"is_login":checklogin(req)};
    res.render("user/shop.ejs",obj);
});

router.get("/blog",async function(req,res){
    var data = await exe ("SELECT * FROM company");
    var obj = {"company_info":data[0],"is_login":checklogin(req)};
    res.render("user/blog.ejs",obj);
});

router.get("/contact",async function(req,res){
    var data = await exe ("SELECT * FROM company");
    var obj = {"company_info":data[0],"is_login":checklogin(req)};
    res.render("user/contact.ejs",obj);
});

router.get("/product_info/:id",async function(req,res){
    var id = req.params.id;
    var products =await exe(`SELECT * FROM product WHERE
        product_id='${id}'`);

        var products_pricing =await exe(`SELECT * FROM product_pricing WHERE
            product_id='${id}'`);

    if(checklogin(req)){
        var customer_id = req.session.customer_id;

        var products_pricing = await exe(`
           SELECT 
    *,
    (SELECT MIN(card_id) FROM card WHERE customer_id = '${customer_id}' AND 
    card.product_pricing_id = product_pricing.product_pricing_id) AS card_id 
FROM product_pricing WHERE product_id='${id}'`) ;

            console.log(products_pricing);
    }

    var data = await exe ("SELECT * FROM company");
   
    var obj = {"company_info":data[0],"products":products[0],"product_pricing":products_pricing,"is_login":checklogin(req)};
    res.render("user/product_info.ejs",obj);
});

router.get("/login",async function(req,res){
    var data = await exe ("SELECT * FROM company");
    var obj = {"company_info":data[0],"is_login":checklogin(req)};
    res.render("user/login.ejs",obj);
});



router.get("/register",async function(req,res){
    var data = await exe (`SELECT * FROM company`);
    var obj = {"company_info":data[0],"is_login":checklogin(req)};
    res.render("user/register.ejs",obj);
});

router.post("/do_register",async function(req,res){
    var d=req.body;

    var sql=`INSERT INTO customers(customer_name,customer_mobile,customer_email,customer_password) VALUES 
    ('${d.customer_name}','${d.customer_mobile}','${d.customer_email}','${d.customer_password}')`;
    var data=await exe(sql);

    //res.send(data);
   res.redirect("/login");
})

router.post("/do_login",async function(req,res){
    var d=req.body;

    var sql=`SELECT * FROM  customers WHERE customer_mobile='${d.customer_mo}' AND customer_password='${d.customer_password}' `;
 var data=await exe(sql);
    if(data.length > 0){
        req.session.customer_id = data[0]['customer_id'];
        res.redirect("/shop");

    }
    else{

        res.send("login failed")

    }

    var data=await exe(sql);
   // res.send(data);
});

function verifyUrl(req,res,next) {
    req.session.customer_id = req.session.customer_id;
    if (req.session.customer_id) {
        // If customer_id exists in the session, proceed to the next middleware or route handler
        next();
    } else {
        // Otherwise, redirect to the login page
        res.redirect("/login");
    }
}


router.get("/add_to_card/:product_id/:product_pricing_id",verifyUrl,async function(req,res){
    console.log(req.session);
    var d= req.params;
    d.qty =1;
    d.customer_id = req.session.customer_id;
    var sql= `INSERT INTO card (product_id,product_pricing_id,customer_id,qty)
    VALUES ('${d.product_id}','${d.product_pricing_id}','${d.customer_id}','${d.qty}')`;

    var data=await exe(sql);
    //res.send(data);
    res.redirect("/shop");
});

router.get("/logout",function(req,res){
    req.session.customer_id = undefined;
    res.redirect("/shop");
});

router.get("/cart",verifyUrl ,async function(req,res){
    var data = await exe (`SELECT * FROM company`);
    var sql=`SELECT * FROM product,product_pricing,card 
    WHERE 
    product.product_id = product_pricing.product_id 
    AND 
    product_pricing.product_pricing_id = card.product_pricing_id 
    AND 
    product.product_id = card.product_id
    AND 
    card.customer_id = '${req.session.customer_id}'
    `;

    //res.send(sql)

    var card = await exe(sql);
   var obj = {"company_info":data[0],"is_login":checklogin(req),"card":card};
  res.render("user/card.ejs",obj);
});

router.post("/increace_qty_in_backend",async function(req,res){
    var sql = `UPDATE card SET qty =qty+1 WHERE card_id = '${req.body.card_id}' `;
    var data= await exe(sql);
    res.send(data);
});

router.post("/decrease_qty_in_backend",async function(req,res){
    var sql = `UPDATE card SET qty =qty-1 WHERE card_id = '${req.body.card_id}' `;
    var data= await exe(sql);
    res.send(data);
});



module.exports = router;