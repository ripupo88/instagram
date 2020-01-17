parser = require('instagram-id-to-url-segment');
let Promise = require('bluebird');
let fs = Promise.promisifyAll(require('fs'));

async function uploadPicture(
   ig,
   caption,
   picturePath,
   pk,
   pk2,
   extraInfo = new Object()
) {
   //ig.publish.photo It can only support files in buffer
   let pictureBuffer = await fs.readFileAsync(picturePath);
   let pictureSizeInBytes = await fs.statSync(picturePath);

   /*  
        As of today 26/09/2019 
        The maximum length of the caption is 2200
        The maximum size in MB is 60
        The aspect ratios valids are 1:1 max=1080x1080 min=600x600, 4:5 max=1080x1350 min=480x600, 1.91:1 max=1080x566 min=600x400
        References : https://metricool.com/instagram-image-size/ , https://www.quora.com/What-is-the-maximum-file-size-on-Instagram , https://www.socialreport.com/insights/article/360020940251-The-Ultimate-Guide-to-Social-Media-Post-Lengths-in-2019
        TODO: check the sizes and aspect ratios... ¿Use a excternal package?
    */

   if (caption.length <= 2200 || pictureSizeInBytes <= 60000000) {
      let publishedPicture = await ig.publish.photo({
         caption: caption,
         file: pictureBuffer,
         usertags: {
            in: [
               {
                  user_id: pk,
                  position: [
                     Math.ceil((Math.random() * 0.7998 + 0.0001) * 100) / 100 +
                        0.1,
                     Math.ceil((Math.random() * 0.7998 + 0.0001) * 100) / 100 +
                        0.1
                  ]
               },
               {
                  user_id: pk2,
                  position: [
                     Math.ceil((Math.random() * 0.7998 + 0.0001) * 100) / 100 +
                        0.1,
                     Math.ceil((Math.random() * 0.7998 + 0.0001) * 100) / 100 +
                        0.1
                  ]
               }
            ]
         }
      });

      const timestamp =
         new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000;
      const link = 'https://www.instagram.com/p/' + publishedPicture.media.code;

      ig.db
         .get('mediaUploaded')
         .push({
            id: ig.shortid.generate(),
            type: 'picture',
            media_id: parser.urlSegmentToInstagramId(
               publishedPicture.media.code
            ),
            caption: caption,
            link: link,
            created_at: timestamp,
            extra_info: extraInfo
         })
         .write();

      return console.log('Posted new media: '.green + link.green);
   } else {
      return 'cant_post';
   }
}

module.exports = uploadPicture;
