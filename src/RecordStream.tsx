import React, { useEffect, useState, useRef } from "react";
import { getScreenStream, getVideoStream, getURL } from "./lib/StreamRTC";
import ProctorRTC, { getModel } from "./lib/ProctorRTC";
// import { getModel, proctorActivity } from "./lib/proctorRTC";
const RecordStream = () => {
  const [facesCount, setFacesCount] = useState(0);
  const [warningsCount, setWarningsCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  let localWebCamStream = useRef(null);
  let canvasRef = useRef<React.MutableRefObject<any>>(null);
  let recordRef = useRef(null);
  let imagePallet = useRef(null);
  const [pics, setPics] = useState([]);
  const handleStreamEnded = () => {
    console.log("::StreamEnded::");
  };

  const handleVideoStream = async (
    stream: MediaStream,
    ref: React.MutableRefObject<any>
  ) => {
    console.log("handleVideoStream", stream, ref);
    console.log(typeof stream);
    const streamURL = await getURL(stream);
    return new Promise((resolve, reject) => {
      if (!stream || !ref) {
        reject();
      }
      // console.log( getURL(stream));
      ref.current.srcObject = streamURL;
      ref.current.onloadedmetadata = () => {
        resolve();
      };
    });
  };
  const handleStartRecord = async (event: any) => {
    event.preventDefault();
    let screenStream;
    let videoStream;
    let modelPath = null;
    console.log(event.target);
    try {
      screenStream = (await getScreenStream(true)) as MediaStream;
      console.log(screenStream.getTracks());
      screenStream.getTracks()[0].onended = handleStreamEnded;
    } catch (error) {
      console.log("ere", error);
    }
    try {
      videoStream = (await getVideoStream(true)) as MediaStream;
      console.log(videoStream.getTracks());
      videoStream.getTracks()[0].onended = handleStreamEnded;
    } catch (error) {
      console.log("ere", error);
    }
    const model = getModel;
    Promise.all([
      model,
      handleVideoStream(videoStream as MediaStream, localWebCamStream)
    ])
      .then(async values => {
        console.log("Model Loaded and Stream Added");
        modelPath = values[0];
        console.log(modelPath);
        // proctorActivity(
        //   setPics,
        //   localWebCamStream.current,
        //   modelPath,
        //   1000,
        //   canvasRef
        // );
      })
      .catch(error => {
        console.error(error);
        setErrorMessage("Permissions Denied or Model Error");
      });
    // if (modelPath && canvasRef) {
    console.log("called");
    const proctorRTC = new ProctorRTC(
      {
        stream: videoStream as MediaStream,
        canvasRef: canvasRef
      },
      1000,
      modelPath
    );
    console.log(proctorRTC);
    proctorRTC.proctorActivity();
    // }
  };
  useEffect(() => {
    console.log(pics);
  }, [pics]);
  return (
    <>
      <form action="" onSubmit={handleStartRecord}>
        <input type="text" name="" required id="" />
        <input type="submit" value="Start Record" />
      </form>
      <video
        autoPlay
        playsInline
        muted
        id="localWebCamStream"
        ref={localWebCamStream}
        width="320"
        height="240"
        style={{
          borderRadius: 10,
          border: "solid",
          position: "absolute",
          zIndex: -1
        }}
      />
      <canvas
        ref={() => canvasRef}
        width="320"
        height="240"
        style={{
          display: "none",
          borderRadius: 10,
          border: "solid",
          borderColor: "red",
          zIndex: 3
        }}
        id="canvas"
      />
    </>
  );
};

export default RecordStream;
