const imageUpload = document.getElementById("imageUpload");
let predictedAges = [];
let choose = document.getElementById("choose");

async function make() {
const MODEL_URL ="/face-api/weights/";

await faceapi.loadSsdMobilenetv1Model(MODEL_URL) 
await faceapi.loadFaceRecognitionModel(MODEL_URL)
await faceapi.loadFaceExpressionModel(MODEL_URL)
await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)

//枠の結果表示
let container = document.createElement('div');
container.id = "Container"

//これがないと枠が画像の上に来ない
container.style.position="relative";
container.style.width ="390px";
container.style.height="390px";

choose.append(container);

imageUpload.addEventListener('change' , async() => {  
  //ここでhtmlの「body」上に画像ファイルを表示
  const Image = imageUpload.files[0];
  console.log(Image);
  console.log(Image.lastModifiedDate);
  let date = document.querySelector("#date");
  date.innerHTML =Image.lastModifiedDate;

  let image = await faceapi.bufferToImage(imageUpload.files[0]);
  
  container.append(image);

  const canvas = faceapi.createCanvasFromMedia(image);
  canvas.style.position ="absolute";
  canvas.style.top ="0";
  canvas.style.left="0";
  
  container.append(canvas);

  //枠のサイズをレスポンシブにするため(これをwidth:400とかにしてしまうと、枠の形が固定されてしまう)
  const displaySize = { width:image.width , height:image.height }
  faceapi.matchDimensions(canvas , displaySize);
  
  const detections = await faceapi.detectAllFaces(image).withFaceExpressions().withAgeAndGender()
  console.log(detections);

  const resizedDetections = faceapi.resizeResults(detections , displaySize);

  resizedDetections.forEach(detection => {
    const box = detection.detection.box
    const drawOptions = {
      lineWidth :1.3 ,
      boxColor : "rgba(6, 247, 106, 0.89)"
    }
    const drawBox = new faceapi.draw.DrawBox(box , drawOptions)
    drawBox.draw(canvas);

  })
  
  let Age1 = document.querySelector("#Age1");  
  let Gender1 = document.querySelector("#Gender1");
  let GenderProbability1 = document.querySelector("#GenderProbability1");
  let Angry1 = document.querySelector("#Angry1");  
  let Disgusted1 = document.querySelector("#Disgusted1");  
  let Fearful1 = document.querySelector("#Fearful1");  
  let Happy1 = document.querySelector("#Happy1");  
  let Neutral1 = document.querySelector("#Neutral1");  
  let Sad1 = document.querySelector("#Sad1");  
  let Surprised1 = document.querySelector("#Surprised1");  

let ageResult = `<p> Age : ${detections[0].age.toFixed(0)} years</p>`
let gender =`<p> Gender : ${detections[0].gender}</p>`
let genderProbability =`<p> Gender Probability : ${detections[0].genderProbability*100}%</p>`
let angry = `<p> Angry : ${(detections[0].expressions.angry)*100}%</p>`
let disgusted = `<p> Disgusted : ${detections[0].expressions.disgusted*100}%</p>`
let fearful = `<p> Fearful : ${detections[0].expressions.fearful*100}%</p>`
let happy = `<p> Happy : ${detections[0].expressions.happy*100}%</p>`
let neutral = `<p> Neutral : ${detections[0].expressions.neutral*100}%</p>`
let sad = `<p> Sad : ${detections[0].expressions.sad*100}%</p>`
let surprised = `<p> Surprised : ${detections[0].expressions.surprised*100}%</p>`

Age1.innerHTML =ageResult;
Gender1.innerHTML =gender;
GenderProbability1.innerHTML =genderProbability;
Angry1.innerHTML = angry;
Disgusted1.innerHTML =disgusted;
Fearful1.innerHTML =fearful;
Happy1.innerHTML =happy;
Neutral1.innerHTML =neutral;
Sad1.innerHTML =sad;
Surprised1.innerHTML =surprised;

//使うときがきたら使う
const angryResult = detections[0].expressions.angry ;
const disgustedResult =  detections[0].expressions.disgusted ;
const fearfulResult = detections[0].expressions.fearful ;
const happyResult = detections[0].expressions.happy ;
const neutralResult = detections[0].expressions.neutral ;
const sadResult = detections[0].expressions.sad ;
const surprisedResult = detections[0].expressions.surprised ;

  const age = resizedDetections[0].age;
  const interpolatedAge = interpolateAgePredictions(age);
  const bottomRight = {
    x: resizedDetections[0].detection.box.bottomRight.x - 50,
    y: resizedDetections[0].detection.box.bottomRight.y
  };

  const drawTextOptions = {
    fontColor :  "rgba(6, 247, 106, 0.89)" , 
    backgroundColor : "rgba(0,0,0,0)"
  }
  new faceapi.draw.DrawTextField(
    [`${faceapi.utils.round(interpolatedAge , 0)}years`],
    bottomRight
   , drawTextOptions ).draw(canvas);
})

function interpolateAgePredictions(age) {
  predictedAges = [age].concat(predictedAges).slice(0, 30);
  const avgPredictedAge =
    predictedAges.reduce((total, a) => total + a) / predictedAges.length;
  return avgPredictedAge;
}
}

make();


