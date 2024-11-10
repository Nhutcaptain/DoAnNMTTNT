const container = document.querySelector('#container');
const fileInput = document.querySelector('#fileInput');
let faceMatcher;
async function loadTrainingData() {
    const labels = ['Messi', 'Ronaldo','Faker', 'Ánh Viên', 'Yuki Ishikawa']

    const faceDescriptors = [];
    for (const label of labels) {
        const descriptors = [];
        for(let i = 1; i <= 4 ; i++) {
            const image = await faceapi.fetchImage(`/data/${label}/${i}.jpg`);
            const detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();
            descriptors.push(detection.descriptor);
            
        }
        faceDescriptors.push(new faceapi.LabeledFaceDescriptors(label, descriptors));
        Toastify({text: `Đã trainning xong dữ liệu cho ${label}`}).showToast();
    }
    return faceDescriptors
}



async function init() {
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
    ])

    const trainingData = await loadTrainingData();
    faceMatcher = new faceapi.FaceMatcher(trainingData, 0.6);
    console.log(faceMatcher);
    Toastify({text: 'Dữ liệu sẵn sàng'}).showToast();
    document.querySelector('#fileInput').style.display = 'block';
}

init();

fileInput.addEventListener('change', async (e) => {
    const file = fileInput.files[0];

    const image = await faceapi.bufferToImage(file);
    const canvas = faceapi.createCanvasFromMedia(image);
    container.innerHTML = '';
    container.append(image);
    container.append(canvas);

    const size = {
        width: image.width, height: image.height
    }

    faceapi.matchDimensions(canvas, size);
    const detection = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
    const resizeDetections = faceapi.resizeResults(detection, size);

    for (const detection of resizeDetections) {
        const box = detection.detection.box;
    
        const drawBox = new faceapi.draw.DrawBox(box, { label: faceMatcher.findBestMatch(detection.descriptor).toString()})
        
        drawBox.draw(canvas);
    }

})