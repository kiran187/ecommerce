


var express = require("express");
var exe = require("./connection");

var router = express.Router()


 router.get("/",function(req,res){
    res.render("admin/index.ejs");
});

router.get("/abount_company",async function(req,res){
    var data = await exe ("SELECT * FROM company");
    var obj = {"company_info":data[0]};
    res.render("admin/abount_company.ejs",obj);
});


router.post("/admin/save_company_details",async function(req,res){
    var d= req.body;
    var sql = `UPDATE company SET company_name ='${d.company_name}',company_number ='${d.company_number}',
   company_email ='${d.company_email}',company_address ='${d.company_address}',
    instagram_link ='${d.instagram_link}',teligram_link ='${d.teligram_link}',
   twitter_link ='${d.twitter_link}',whatsapp_no ='${d.whatsapp_no}',
   youtube_link ='${d.youtube_link}' `;
    var data= await exe (sql);
   // res.send(data);
   res.redirect("/admin/abount_company");
});
router.get("/slider",async function(req,res){

    var data = await exe("SELECT * FROM slider");
    var obj = {"slider":data}
    res.render("admin/slider.ejs",obj);
});

router.post("/admin/save_slide",async function(req,res){
    if(req.files){
        req.body.slide_image = new Date().getTime() + req.files.slide_image.name;
        req.files.slide_image.mv("public/uploads/"+req.body.slide_image);
    }
    var d=req.body;
    var sql = `INSERT INTO slider(slide_titale,slide_details,button_link,button_text,slide_image ) VALUES
    (${d.slide_titale},${d.slide_details},${d.button_link},${d.button_text},${d.slide_image})`;
    var data = await exe(sql);
    res.send(data);
    //res.redirect("/admin/slider");
    
});
router.get("/category",async function(req,res){
    var data = await exe('SELECT * FROM category ');
    var obj = {"cats":data};
    res.render("admin/category.ejs",obj);
});

router.post("/admin/save_category",async function(req,res){
    var d=req.body;
    var sql = `INSERT INTO category(category_name) VALUES ('${d.category_name}')`;
    var data = await exe(sql);
    //res.send(data);
    res.redirect("/admin/category");
});


router.get("/add_product",async function(req,res){
    var data = await exe(`SELECT * FROM category`);
    var obj = {"cats":data};
    res.render("admin/add_product.ejs",obj);
});

router.post("/admin/save_product",async function(req,res){

    if(req.files.product_image1){
req.body.product_image1 = new Date().getTime()+req.files.product_image1.name;
req.files.product_image1.mv("public/uploads/"+req.body.product_image1);
    }

    if(req.files.product_image2){
        req.body.product_image2 = new Date().getTime()+req.files.product_image2.name;
        req.files.product_image2.mv("public/uploads/"+req.body.product_image2);
            }

            if(req.files.product_image3){
                req.body.product_image3 = new Date().getTime()+req.files.product_image3.name;
                req.files.product_image3.mv("public/uploads/"+req.body.product_image3);
                    }
                    if(req.files.product_image4){
                        req.body.product_image4 = new Date().getTime()+req.files.product_image4.name;
                        req.files.product_image4.mv("public/uploads/"+req.body.product_image4);
                            }

        else
        req.body.product_image3 = "";
        if(req.files.product_image3){
            req.body.product_image3 = new Date().getTime()+req.files.product_image3.name;
            req.files.product_image3.mv("public/uploads/"+req.body.product_image3);
                }
                else

                req.body.product_image4 = "";
                if(req.files.product_image4){
                    req.body.product_image4 = new Date().getTime()+req.files.product_image4.name;
                    req.files.product_image4.mv("public/uploads/"+req.body.product_image4);
                        }
    
    var d=req.body;
    //console.log(req.files);

    var sql = `INSERT INTO product (
    category_id,
        product_name,
        product_company,
        product_colors,
        product_label, 
        product_details,
        product_image1,
        product_image2,
        product_image3,
        product_image4
    ) VALUES (
     '${d.category_id}',
        '${d.product_name}',
        '${d.product_company}',
        '${d.product_colors}',
        '${d.product_label}',
        '${d.product_details}', 
        '${d.product_image1}',
        '${d.product_image2}',
        '${d.product_image3}',
        '${d.product_image4}'
    )`;

    var data = await exe(sql);
    
      product_id = data.insertId;

      for (var i=0;i<d.product_size.length;i++){
        var sql = `INSERT INTO product_pricing (product_id,product_size,product_price,product_duplicate_price) VALUES
        ('${product_id}','${d.product_size[i]}','${d.product_price[i]}','${d.product_duplicate_price	
            [i]}')`;
        var data = await exe(sql);
        //console.log(data);
      }

   
            //res.send(req.body);
            res.redirect("/admin/add_product");
        });

        router.get("/product_list",async function(req,res){
            var sql = `SELECT * ,(SELECT MIN (product_price) FROM product_pricing WHERE
            product_pricing.product_id = product.product_id) as min_price,
            
            (SELECT MAX (product_price) FROM product_pricing WHERE
            product_pricing.product_id = product.product_id) as max_price

            FROM product
            `;
            var data = await exe(sql);
            var obj = {"products":data};
            res.render("admin/product_list.ejs",obj);
        });

        router.get("/view_product/:product_id",async function(req,res){
            var id =req.params.product_id;
            var sql = `SELECT * FROM  product WHERE product_id = '${id}'`;
            var data = await exe(sql);
    
            var sql2 = `SELECT * FROM  product_pricing WHERE product_id = '${id}'`;
            var pricing = await exe(sql2);
    
    
            var obj = {"product_info":data[0],"pricing":pricing};
       
           res. render("admin/view_product.ejs",obj);
        });

        router.get("/edit_product/:product_id",async function(req,res){
            var id =req.params.product_id;
            var sql = `SELECT * FROM  product WHERE product_id = '${id}'`;
            var data = await exe(sql);
    
            var sql2 = `SELECT * FROM  product_pricing WHERE product_id = '${id}'`;
            var pricing = await exe(sql2);
    
    
            var obj = {"product_info":data[0],"pricing":pricing};
      
           res. render("admin/edit_product.ejs",obj);
        });

        router.post("/admin/update_product",async function(req,res){

            var d=req.body;
            if(req.files){
                if(req.files.product_image1){

                    var product_image1 = new Date().getTime()+req.files.product_image1.name;
                    req.files.product_image1.mv("public/uploads/"+product_image1);
                    var isql1 = `UPDATE product SET product_image1 = '${product_image1}'
                    WHERE product_id = '${d.product_id}'` ;
await exe (isql1);


                }
            }

            if(req.files){
                if(req.files.product_image2){

                    var product_image2 = new Date().getTime()+req.files.product_image2.name;
                    req.files.product_image2.mv("public/uploads/"+product_image2);
                    var isql1 = `UPDATE product SET product_image2 = '${product_image2}'
                    WHERE product_id = '${d.product_id}'` ;
await exe (isql1);



                }
            }
            
            
            var sql = `UPDATE product SET  
           product_name =    '${d.product_name}',
        
        product_company  =     '${d.product_company}',
        
        product_colors = '${d.product_colors}',
       
        product_label  =  '${d.product_label}',
        
        product_details = '${d.product_details}' WHERE product_id = '${d.product_id}'

        
       `;

       var data = await exe(sql);

for(var i=0; i<d.product_pricing_id.length; i++){

var sql = `UPDATE product_pricing SET
product_size = '${d.product_size[i]}',
product_price = '${d.product_price[i]}',
product_duplicate_price = '${d.product_duplicate_price[i]}' WHERE product_pricing_id = '${d.product_pricing_id[i]}'

`;

var data = await exe(sql);

}



           // res.send(req.body);
           res.redirect("/admin/product_list");
        });

router.get("/delete_product/:id",async function(req,res){

    var id = req.params.id;

    var sql = `DELETE FROM product WHERE product_id = '${id}'`;
    var sql2 = `DELETE FROM product_pricing  WHERE product_id = '${id}'`;

    var data = await exe(sql);
    var data2 = await exe(sql2);

    res.redirect("/admin/product_list");
    //res.send(data2);


});

        


module.exports = router;

//CREATE TABLE company (company_id INT PRIMARY KEY AUTO_INCREMENT,company_name VARCHAR(100),company_number VARCHAR(15),
//company_email VARCHAR(100),company_address TEXT,instagram_link TEXT,teligram_link TEXT,twitter_link TEXT,whatsapp_no VARCHAR(15),youtube_link)
//INSERT INTO company (company_name) VALUES ('')

//CREATE TABLE slider (slider_id INT PRIMARY KEY AUTO_INCREMENT,slide_titale VARCHAR(50),slide_details TEXT,
//button_link TEXT,button_text VARCHAR(100),slide_image TEXT)

//CREATE TABLE category (category_id INT PRIMARY KEY AUTO_INCREMENT ,category_name VARCHAR(100))
//
//



