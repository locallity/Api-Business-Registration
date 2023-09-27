const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const env =  require('dotenv').config()
const multer = require('multer');
const AWS = require('aws-sdk');
const uploadToS3 = require('../middlewares/imageUpload');
const deleteFromS3 = require('../middlewares/imageUpload');
const logoUploadToS3 = require('../middlewares/logoUpload');
const deleteLogoFromS3 = require('../middlewares/logoUpload');


exports.create=(request,response)=>{


   const business_id = uuidv4().slice(0,10);
   const name = request.body['name'];
   const price = request.body['price'];
   const manager = request.body['manager'];
   const description = request.body['description'];
//    const event_classification = request.body['event_classification'];
//    const capacity_people = request.body['capacity_people'];
//    const address_1 = request.body['address_1'];
//    const address_2 = request.body['address_2'];
//    const address_3 = request.body['address_3'];
   const city = request.body['city'];
   const state = request.body['state'];
   const country = request.body['country'];
   const postal_code = request.body['postal_code'];
   const cell_phone_number = request.body['cell_phone_number'];
   const email = request.body['email'];
   const event_type = request.body['event_type']; 
//    const publication_likes = request.body['publication_likes']; 
//    const questions = request.body['questions'];
   //const policies_terms = request.body['policies_terms'];
   const delivery = request.body['delivery'];
  // const shipping = request.body['shipping'];
   const bill  = request.body['bill'];
   const antiquity = request.body['antiquity'];
   const physical_store = request.body['physical_store'];
   const online_store = request.body['online_store'];
   const url_google = request.body['url_google'];
   const business_days = request.body['business_days'];   
   const category = request.body['category'];
   const subcategory = request.body['subcategory'];
   const discount_code = request.body['discount_code'];
   const business_age = request.body['business_age'];
   const municipality = request.body['municipality'];
   const accepts_credit_cards = request.body['accepts_credit_cards'];
   const is_owner_verified = request.body['is_owner_verified'];
   const status = request.body['status'];
   const start_date = request.body['start_date'];
   const end_date = request.body['end_date'];
   const social_networks = request.body['social_networks'];
   const national_shipment = request.body['national_shipment'];
   const local_shipment = request.body['local_shipment'];
   const whatsapp_no = request.body['whatsapp_no'];
   const socialNetworkUrls = social_networks.split(',');

   const socialMediaInfo = socialNetworkUrls.map((url) => {
     const urlObject = new URL(url);
     return {
       url,
       name: urlObject.hostname.toLowerCase(),
     };
   });
  
   // Create a Set to store unique social media names
   const uniqueNamesSet = new Set();
   // Filter out duplicate social media names and keep only the first occurrence
   const filteredSocialMediaInfo = socialMediaInfo.filter(({ name }) => {
     if (!uniqueNamesSet.has(name)) {
       uniqueNamesSet.add(name);
       return true;
     }
     return false;
   });
   
   // Extract URLs from the filtered social media info
   const filteredUrls = filteredSocialMediaInfo.map(({ url }) => url);
//    response.json({social:filteredUrls});
   
   // Now you can use the filteredUrls for further processing or response
   
//    if (filteredUrls.length !== socialMediaInfo.length) {

    const sql = `INSERT INTO negocio(id_business, name, price, manager, description, city, state, country, postal_code, delivery, national_shipment, local_shipment, bill, antiquity, email, physical_store, online_store, url_google, business_age, municipality, cell_phone_number, business_days, category, subcategory, discount_code, accepts_credit_cards, is_owner_verified, social_networks, status, start_date, end_date, whatsapp_no) VALUES ('${business_id}', '${name}', '${price}', '${manager}', '${description}','${city}','${state}', '${country}','${postal_code}','${delivery}','${national_shipment}','${local_shipment}','${bill}', '${antiquity}','${email}','${physical_store}', '${online_store}','${url_google}','${business_age}','${municipality}','${cell_phone_number}','${business_days}','${category}','${subcategory}','${discount_code}','${accepts_credit_cards}','${is_owner_verified}','${filteredUrls}','${status}','${start_date}', '${end_date}','${whatsapp_no}')`

    db.query(sql, (err,data)=>{
 
        if(data){
 
            response.status(200).json({
                code:200,
                business_id:business_id,
                message:"Data Inserted SuccessFully",})
 
        }else{
 
            response.status(400).json({
                code:400 ,
                message:"Data Insert failed",
                error:err
            })
 
        }
 
 
    })
 
     // console.log(request);
         // Image
         if(request.files && request.files.length>0 ){
 
             for(let i=0;i<request.files.length;i++){
 
              
                 uploadToS3(request.files[i].buffer).then((result)=>{
 
                     const imgLocation = result.Location;
                   
                     const ImageSql = `INSERT INTO images(id_business, image_url) VALUES ("${business_id}","${imgLocation}")`;
                     db.query(ImageSql,(err,data)=>{
 
                         console.log(err);
                         
                     })
 
               })
             }
           
         }
 
         // console.log(request.files);
         const logo = request.files.find(file=> file.fieldname === 'logo')
 
         if(logo){
 
             logoUploadToS3(logo.buffer)
 
             .then((result)=>{
  
               const logo_url = result.Location
 
               const logoSql = `INSERT INTO logos(id_business,logo_url) VALUES ('${business_id}','${logo_url }')`
 
               db.query(logoSql,(err,logo)=>{
 
                 if(err){
 
                     console.log(err)
 
                 }
               })
  
             })
             .catch((err)=>{
  
              console.log(err)
  
             })
  
  
       
 
         }
 
  }



   
// }

exports.getItems=(req,res)=>{


    const business_id = req.params.id;

    const sql = `SELECT * FROM negocio JOIN logos ON negocio.id_business = logos.id_business WHERE negocio.id_business = "${business_id}"`
    const img_sql = `SELECT * FROM images WHERE id_business = "${business_id}"`

    db.query(sql,(err,data)=>{

        if(err){

            res.status(404).json({
                code:404 ,
                message:"Data Not Found",
                error:err
            })

        }else if(data.length === 0){

            res.status(404).json({message: "no record record found"})

        }else{

            db.query(img_sql,(err,images)=>{

                if(err){
                    
                    res.status(404).json({
                        code:404 ,
                        message:"Data Not Found",
                        error:err
                    })
                }

                const imageUrls = images && images.length > 0 ? images.map((row) => row.image_url) : [];

                    res.status(200).json({
                        code:200 ,
                        message:"Data Found",
                        data:{
                            business_details:data,
                            images:imageUrls
                        }
                    })
                

            })

        }
    })

}

exports.UpdateData=(req,res)=>{

    const business_id = req.body['business_id'];
    const selectSql = `SELECT * FROM negocio WHERE id_business = '${business_id}'`;

    db.query(selectSql,(err,data)=>{

        if(err){

            res.status(500).json({ message: "Error occurred while checking ID existence", error: err });

        }else{

            if(data.length === 0){

                res.status(404).json({ message: "ID not found" });

            }else{

               
                const name = req.body['name'];
                const price = req.body['price'];
                const manager = req.body['manager'];
                const description = req.body['description'];
                const capacity_people = req.body['capacity_people'];
                const city = req.body['city'];
                const state = req.body['state'];
                const country = req.body['country'];
                const postal_code = req.body['postal_code'];
                const email = req.body['email'];
                const cell_phone_number = req.body['cell_phone_number'];
                const questions = req.body['questions'];
                const delivery = req.body['delivery'];
                const shipping = req.body['shipping'];
                const bill  = req.body['bill'];
                const antiquity = req.body['antiquity'];
                const physical_store = req.body['physical_store'];
                const online_store = req.body['online_store'];
                const url_google = req.body['url_google'];
                const business_days = req.body['business_days'];
                const category = req.body['category'];
                const subcategory = req.body['subcategory'];
                const discount_code = req.body['discount_code'];
                const business_age = req.body['business_age'];
                const municipality = req.body['municipality'];
                const accepts_credit_cards = req.body['accepts_credit_cards'];
                const is_owner_verified = req.body['is_owner_verified'];
                const start_date = req.body['start_date'];
                const end_date = req.body['end_date'];
                const status = req.body['status'];
                const social_networks = req.body['social_networks'];
                const created_at = new Date();
             
             
             const UpdateSql = `UPDATE negocio SET 
                                         name='${name}',
                                         price='${price}',
                                         manager='${manager}',
                                         description='${description}',
                                         city='${city}',
                                         state='${state}',
                                         country='${country}',
                                         postal_code='${postal_code}',
                                         delivery='${delivery}',
                                         shipping='${shipping}',
                                         bill='${bill}',
                                         antiquity='${antiquity}',
                                         email='${email}',
                                         physical_store='${physical_store}',
                                         online_store='${online_store}',
                                         url_google='${url_google}',
                                         business_age ='${business_age}',
                                         municipality='${municipality}',
                                         cell_phone_number='${cell_phone_number}',
                                         business_days='${business_days}',
                                         category='${category}',
                                         subcategory='${subcategory}',
                                         discount_code='${discount_code}',
                                         questions='${questions}',
                                         accepts_credit_cards='${accepts_credit_cards}',
                                         is_owner_verified='${is_owner_verified}',
                                         social_networks='${social_networks}',
                                         status='${status}',
                                         start_date='${start_date}',
                                         end_date='${end_date}'
                                WHERE id_business = '${business_id}'`;
             
                db.query(UpdateSql,(err,data)=>{
             
                    if(err){
                       
                     res.status(500).json({message:"data Update failed",error:err})
             
                    }else{
             
                     res.status(200).json({message:"data Updated Successfully",error:data})
             
                    }
             
                })

            }

        }
    })
    

}


exports.deleteItem=(req,res)=>{

    const business_id = req.params.id;
    const deleteSql = `DELETE FROM negocio WHERE id_business = "${business_id}"`
    const logoDelSql = `DELETE FROM logos WHERE id_business = "${business_id}"`
    const imgDelSql = `DELETE FROM images WHERE id_business= "${business_id}"`


    const Select_sql = `SELECT * FROM negocio 
    JOIN logos ON negocio.id_business = logos.id_business
    JOIN images on negocio.id_business = images.id_business
    WHERE negocio.id_business = "${business_id}"`

             db.query(Select_sql,(err,data)=>{

              if(err){

                res.status(500).json({ message: "Error occurred while checking ID existence", error: err });

              }else{

                if(data.length === 0){

                    res.status(404).json({ message: "ID not found" });

                }else{


                    data.map((item)=>{

                        const img = item['image_url'];
                        const imageUrlParts  = img.split('/')
                        const imageKey = imageUrlParts[imageUrlParts.length - 1];

                        const logo_item = item['logo_url'];
                        const logoUrlPart = logo_item.split('/')
                        const logoKey = logoUrlPart[logoUrlPart.length-1]

                        deleteFromS3(imageKey);
                        deleteLogoFromS3(logoKey)

                    })


                    db.query(imgDelSql,(err,imgDel)=>{
                        
                        if(err){

                            res.status(400).json({message:"Data Delete Failed",error:err})

                        }else{

                            db.query(logoDelSql,(err)=>{

                                if(err){

                                    res.status(400).json({message:"Data Delete Failed",error:err})
                                    
                                }else{

                                    db.query(deleteSql,(err,data)=>{

                                        if(err){
                
                                            res.status(400).json({message:"Data Delete Failed",error:err})
                
                                        }else{
                            
                                            res.status(200).json({message:"Data Delete Successfully"})
                
                                        }
                
                                    })

                                }
                            })
            


                        }
                    })
                    


                }

              }


            })

}

exports.deleteSingleImg=(req,res)=>{


    const id = req.params.id;

    const delSql = `DELETE FROM images WHERE id="${id}"`
    const imgsql = `SELECT image_url FROM images WHERE id = "${id}"`



    db.query(imgsql,(err,images)=>{

        if(images.length === 0){

            res.status(404).json({message:"Invalid Image id",})

        }else{

            const imageUrl= images[0]['image_url']
            const imageUrlParts = imageUrl.split('/') 
            const imagekey = imageUrlParts[imageUrlParts.length -1]
            deleteFromS3(imagekey);

            db.query(delSql,(err,data)=>{

                if(err){
        
                    res.status(400).json({message:"Image Delete Failed",error:err})
        
                }else{
        
                    res.status(200).json({message:"Image Delete Successfully",data:data})
                }
            })
        }
    })
}
exports.deleteSingleLogo=(req,res)=>{


    const id = req.params.id;
    const logoDelSql = `DELETE FROM logos WHERE id = "${id}"`
    const SelectSql = `SELECT * FROM logos WHERE id = "${id}"`


    db.query(SelectSql,(err,logo)=>{

        if(err){

            res.status(500).json({ message: "Error occurred while checking ID existence", error: err });

        }else{

            if(logo.length === 0){

                res.status(404).json({message:"Invalid Image id",})
    
            }else{

                const logo_item = logo[0]['logo_url'];
                const logoUrlPart = logo_item.split('/')
                const logoKey = logoUrlPart[logoUrlPart.length-1]
                deleteLogoFromS3(logoKey)
             
                db.query(logoDelSql,(err,data)=>{
    
                    if(err){
            
                        res.status(400).json({message:"Logo Delete Failed",error:err})
            
                    }else{
            
                        res.status(200).json({message:"Logo Delete Successfully",data:data})
                    }
                })
            }
        }


    })
}

