const getScreenStream = (withAudio: boolean): Promise<MediaStream | Error> => {
  const constraints = {
    audio: withAudio ? true : false,
    video: true
  };
  const mediaDevices: any = navigator.mediaDevices;
  if (mediaDevices.getDisplayMedia) {
    const stream = mediaDevices
      .getDisplayMedia(constraints)
      .then((screenStream: MediaStream) => {
        console.log("Screen", screenStream);
        return screenStream;
      })
      .catch((err: Error) => {
        throw new Error(err.message);
      });
    return stream;
  } else throw new Error("Get DisplayMedia Error");
};

const getVideoStream = (withAudio: boolean): Promise<MediaStream | Error> => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const stream = navigator.mediaDevices
      .getUserMedia({
        audio: withAudio ? true : false,
        video: {
          facingMode: "user"
        }
      })
      .then((videoStream: MediaStream) => {
        console.log("WebCam", videoStream);
        return videoStream;
      })
      .catch(err => {
        throw new Error(err);
      });
    return stream;
  } else throw new Error("Get UserMedia Error");
};

const getURL = (arg: any): any => {
  var url = arg;
  if (arg instanceof Blob || arg instanceof File) {
    url = window.URL.createObjectURL(arg);
  }
  return url;
};
export { getScreenStream, getVideoStream, getURL };
