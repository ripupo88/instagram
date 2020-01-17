require('./src/tools-for-instagram.js');
let fs = require('fs');
let request = require('request');

(async () => {
   console.log('\n1 -- LOGIN --\n'.bold.underline);
   let instaURL = 'https://www.instagram.com/p/';
   let ig = await login();
   let feedSaved = await ig.feed.saved();
   var mySaved = await feedSaved.items();

   do {
      console.log('\n2 -- Get Last img on saved List -- \n'.bold.underline);

      let pic = mySaved[mySaved.length - 1];

      let info = await getUserInfo(ig, 'hot_models_world_2020');
      let imgId = pic.pk;
      let code = pic.code;
      let pk = pic.user.pk;
      let userName = '@' + pic.user.username;
      let caption = `model ${userName} Pomoted by @hot_models_world_2020`;

      let url = await getPhotoUrl(ig, instaURL + code);
      download(url, 'img/img.jpg', async function() {
         console.log('bajada');
         //await uploadPicture(ig, caption, 'img/img.jpg', pk, info.pk);
         fs.unlink('img/img.jpg', function() {
            console.log('deleted');
         });
         await ig.media.unsave(imgId);
      });
      let timeSleep = Math.ceil(Math.random() * 3600 * 5) + 10800;
      console.log(timeSleep);
      await sleep(4);
   } while (mySaved.length > 0);
})();

let download = (uri, filename, callback) => {
   request.head(uri, function(err, res, body) {
      console.log('url', uri);
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);

      request(uri)
         .pipe(fs.createWriteStream(filename))
         .on('close', callback);
   });
};
