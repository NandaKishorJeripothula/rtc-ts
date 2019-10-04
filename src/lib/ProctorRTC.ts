import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

interface IStreamConfiguration {
  audio: boolean;
  video: boolean;
  screen: boolean;
}
interface IWebCamVideo {
  stream: any;
  canvasRef: React.MutableRefObject<any>;
}

const getModel = cocoSsd.load({ base: "lite_mobilenet_v2" });
export { getModel };
/**
 * /// <reference types="webrtc" />

 */
export default class ProctorRTC {
  private streamConfig: IStreamConfiguration = {} as IStreamConfiguration;
  private webCamVideo: IWebCamVideo;
  private model: any;
  private detectInterval: number;
  private suspiciousPics: URL[];
  private imageGrabber: any;

  constructor(
    webCamVideo: IWebCamVideo,
    detectInterval: number,
    model: any,
    streamConfig?: IStreamConfiguration
  ) {
    this.model = model;
    this.webCamVideo = webCamVideo;
    this.detectInterval = detectInterval;
    this.suspiciousPics = [];

    if (streamConfig) this.streamConfig = streamConfig;
    else
      this.streamConfig.audio = this.streamConfig.video = this.streamConfig.screen = true;
  }

  private setImageGrabber(webCam: IWebCamVideo) {
    const imageGrabber = webCam.canvasRef.current;
    imageGrabber.width = webCam.stream.width;
    imageGrabber.height = webCam.stream.height;
    this.imageGrabber = imageGrabber;
    // const captureImageCanvas = imageGrabber;
  }
  /**
   * proctorActivity
   */
  public proctorActivity = () => {
    console.log("proctorActivity Started");
    if (!this.webCamVideo) throw Error("WebCam Config Error");
    else {
      this.setImageGrabber(this.webCamVideo);
      setInterval(async () => {
        await this.imageGrabber
          .getContext("2d")
          .drawImage(
            this.webCamVideo.stream,
            0,
            0,
            this.imageGrabber.width,
            this.imageGrabber.height
          );
        this.detectFrame();
      }, this.detectInterval);
    }
  };

  private detectFrame = async () => {
    this.model
      .detect(this.webCamVideo.stream)
      .then(async (predictions: any[]) => {
        if (!predictions.length) {
          console.log("No image");
          console.log("No one detected");
          console.log(0);
          console.log("warn");
          // console.log("warin", prevWarningsCount => prevWarningsCount + 1);
          this.captureImage(this.webCamVideo, Date());
        } else if (
          !(predictions.length === 1 && predictions[0].class === "person")
        ) {
          console.log("Suspicious Activity Detected");
          console.log(predictions.length);
          console.log("Suspicious");
          await this.renderPredictions(predictions);
          this.captureImage(this.webCamVideo, Date());
        } else {
          console.log("normal");
          console.log(1);
          //   setFacesCount(1);
          console.log("");
          //   setErrorMessage("");
        }
      });
  };

  renderPredictions = (predictions: any[]): void => {
    let ctx = this.webCamVideo.canvasRef.current.getContext("2d");
    if (!ctx) {
      throw Error("CanvasRef Missing");
    } else {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      // Font options.
      const font = "16px sans-serif";
      ctx.font = font;
      ctx.textBaseline = "top";
      predictions.forEach(prediction => {
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        const width = prediction.bbox[2];
        const height = prediction.bbox[3];
        // Draw the bounding box.
        if (!ctx) {
          throw Error("CanvasRef Missing");
        } else {
          ctx.strokeStyle = "#00FFFF";
          ctx.lineWidth = 4;
          ctx.strokeRect(x, y, width, height);
          // Draw the label background.
          ctx.fillStyle = "#00FFFF";
          const textWidth = ctx.measureText(prediction.class).width;
          const textHeight = parseInt(font, 10); // base 10
          ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
        }
      });

      predictions.forEach(prediction => {
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        // Draw the text last to ensure it's on top.
        if (!ctx) {
          throw Error("CanvasRef Missing");
        } else {
          ctx.fillStyle = "#000000";
          ctx.fillText(prediction.class, x, y);
        }
      });
    }
  };
  private captureImage = (webCam: IWebCamVideo, date: string) => {
    const captureImageCanvas = this.imageGrabber;
    captureImageCanvas
      .getContext("2d")
      .drawImage(
        webCam.stream,
        0,
        0,
        captureImageCanvas.width,
        captureImageCanvas.height
      );
    captureImageCanvas
      .getContext("2d")
      .drawImage(
        webCam.canvasRef.current,
        0,
        0,
        captureImageCanvas.width,
        captureImageCanvas.height
      );
    this.suspiciousPics.push(captureImageCanvas.toDataURL());
  };

  // /**
  //  * getLocalAudio
  //  */
  // private getLocalAudio = async (): Promise<MediaStream | Error> => {
  //   if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  //     return navigator.mediaDevices
  //       .getUserMedia({ audio: true })
  //       .then((audioStream: MediaStream) => audioStream);
  //   } else return new Error("Audio Device/Stream Error");
  // };

  // /**
  //  * getLocalVideo
  //  */
  // private getLocalVideo = async (
  //   withAudio?: boolean
  // ): Promise<MediaStream | Error> => {
  //   const constrains = {
  //     audio: withAudio ? true : false,
  //     video: true
  //   };
  //   if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  //     const videoStream = navigator.mediaDevices
  //       .getUserMedia(constrains)
  //       .then((videoStream: MediaStream) => videoStream)
  //       .catch((err: Error) => {
  //         return err;
  //       });
  //     return videoStream;
  //   } else return new Error("Video Device/Stream Error");
  // };

  // /**
  //  * getLocalScreen
  //  */
  // private getLocalScreen = async (
  //   withAudio?: boolean,
  //   withVideo?: boolean
  // ): Promise<MediaStream | Error> => {
  //   const constrains = {
  //     audio: withAudio ? true : false,
  //     video: withVideo ? true : false
  //   };

  //   const mediaDevices: any = navigator.mediaDevices;

  //   const screenStream = mediaDevices
  //     .getDisplayMedia(constrains)
  //     .then((screenStream: MediaStream) => screenStream)
  //     .catch((err: Error) => {
  //       return err;
  //     });
  //   return screenStream;
  //   // if (
  //   //   (navigator.mediaDevices as any) &&
  //   //   navigator.mediaDevices.getDisplayMedia
  //   // ) {
  //   // }
  // };
  // /**
  //  * getLocalStream
  //  */
  // public getLocalStream = async (
  //   mediaStream?: "audio" | "video" | "screen"
  // ) => {
  //   try {
  //     if (!mediaStream) {
  //     } else
  //       switch (mediaStream) {
  //         case "audio":
  //           return this.getLocalAudio();
  //           break;
  //         case "video":
  //           return this.getLocalVideo();
  //           break;
  //         case "screen":
  //           return this.getLocalScreen();
  //           break;
  //       }
  //   } catch (error) {
  //     return error;
  //   }
  // };
}
