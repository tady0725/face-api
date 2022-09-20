let video = document.getElementById("video");
let canvas = document.body.appendChild(document.createElement("canvas"));
let ctx = canvas.getContext("2d");
let displaySize;
// window size
let width = 1280;
let height = 720;

const startSteam = () => {
    // 建立串流
    console.log("----- START STEAM ------");
    
    navigator.mediaDevices.getUserMedia({
        video: {width, height},
        audio : false
    }).then((steam) => {video.srcObject = steam});
}

console.log(faceapi.nets);

console.log("----- START LOAD MODEL ------");
// 認證載入 model
Promise.all([
    //年紀 和 性別
    faceapi.nets.ageGenderNet.loadFromUri('models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('models'),
    faceapi.nets.tinyFaceDetector.loadFromUri('models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('models'),
    faceapi.nets.faceExpressionNet.loadFromUri('models')
]).then(startSteam);


async function detect() {
    const detections = await faceapi.detectAllFaces(video)
                                //.withFaceLandmarks()
                                .withFaceExpressions()
                                .withAgeAndGender();


    // console.log(detections);
    const myJSON = JSON.stringify(detections);
    var st = myJSON.slice(1,myJSON.length - 1);
    console.log(st);
    
    const obj = JSON.parse(st);

    console.log(obj.detection._box);

    
    ctx.clearRect(0,0, width, height);

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    faceapi.draw.drawDetections(canvas, resizedDetections);
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    //console.log(resizedDetections);
    resizedDetections.forEach(result => {
        const {age, gender, genderProbability} = result;
        new faceapi.draw.DrawTextField ([
            `${Math.round(age,0)} age`,
            `${gender} `//${Math.round(genderProbability)}
        ],
        result.detection.box.bottomRight
        ).draw(canvas);
    });
}

video.addEventListener('play', ()=> {
    displaySize = {width, height};
    faceapi.matchDimensions(canvas, displaySize);

    //等待時間
    setInterval(detect, 1000);
})