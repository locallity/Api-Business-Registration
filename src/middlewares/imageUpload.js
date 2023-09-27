const env =  require('dotenv').config()
const multer = require('multer');
const AWS = require('aws-sdk');


const awsConfig = {
    
    accessKeyId:process.env.ACCESSKEYID, 
    secretAccessKey:process.env.SECRETACCESSKEY,
    region: process.env.REGION
}


const s3 = new AWS.S3(awsConfig)

const uploadImage = multer({

    limits: {
        fileSize: 1024 * 1024 * 10 // 10mb file size
    },
    fileFilter: (req, file, callback) => {

        if(file.mimetype === 'image/jpeg'||file.mimetype === 'image/png'||file.mimetype === 'image/jpg'){
            callback(null,true);
        }else{
            callback("File type not Supported",false);
        }
    },

}).array("images",8);

const uploadToS3 = (fileData)=>{
    return new Promise((resolve,reject)=>{

        const params = {
            Bucket:"locallity",
            Key:`${Date.now().toString()}.jpg`,
            Body: fileData
        }


        s3.upload(params,(err,data)=>{

            if(err){

                reject(err)
            }
            return resolve(data)

        })

    })
}


const deleteFromS3 = (imageKey)=>{

    const deleteParams = {
        Bucket: 'locallity',
        Key: imageKey,
      };

      s3.deleteObjects(deleteParams,(err,data)=>{

        return new Promise((reject,resolve)=>{

                if(err){

                    reject(err)
                }
                return resolve(data)
         
            })

        })
        


}

module.exports = uploadToS3,deleteFromS3
