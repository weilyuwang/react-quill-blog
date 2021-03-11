import React, { useState, useRef, useCallback } from "react";
import ReactQuill, { Quill } from "react-quill";
import { Spin, Icon } from "antd";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import Resize from "quill-resize-module-fix";
const Embed = Quill.import("blots/block/embed");

Quill.register("modules/resize", Resize);
class AudioBlot extends Embed {
  static create(value) {
    const node = super.create();
    node.setAttribute("src", value.src);
    node.setAttribute("controls", "");
    return node;
  }

  static value(node) {
    return {
      src: node.getAttribute("src"),
    };
  }
}

AudioBlot.blotName = "audio";
AudioBlot.tagName = "audio";
Quill.register(AudioBlot);
class ImageBlot extends Embed {
  static create(value) {
    console.log("ImageBlot:", value);

    const node = super.create();
    for (const key in value) {
      node.setAttribute(key, value[key]);
    }
    node.setAttribute("width", "80%");
    return node;
  }

  static value(node) {
    return {
      src: node.getAttribute("src"),
      alt: node.getAttribute("alt"),
      style: node.getAttribute("style"),
      class: node.getAttribute("class"),
    };
  }
}
ImageBlot.blotName = "image";
ImageBlot.tagName = "img";
Quill.register(ImageBlot);

class VideoBlot extends Embed {
  static create(value) {
    console.log("VideoBlot: ", value);

    if (value && value.src) {
      // video
      const node = super.create();
      for (const key in value) {
        node.setAttribute(key, value[key]);
      }
      node.setAttribute("width", "80%");
      node.setAttribute("controls", "");

      return node;
    } else {
      // iframe
      const iframeTag = document.createElement("iframe");
      iframeTag.setAttribute("src", value);
      iframeTag.setAttribute("frameborder", "0");
      iframeTag.setAttribute("allowfullscreen", true);
      iframeTag.setAttribute("width", "80%");
      return iframeTag;
    }
  }

  static value(node) {
    if (node.getAttribute("title")) {
      // video
      return {
        src: node.getAttribute("src"),
        alt: node.getAttribute("title"),
        title: node.getAttribute("title"),
        style: node.getAttribute("style"),
        class: node.getAttribute("class"),
      };
    } else {
      // iframe
      return {
        src: node.getAttribute("src"),
        frameborder: node.getAttribute("src"),
        allowfullscreen: node.getAttribute("allowfullscreen"),
      };
    }
  }
}
VideoBlot.blotName = "video";
VideoBlot.tagName = "video";
Quill.register(VideoBlot);

const QuillEditor = ({ onContentChange, content }) => {
  const reactQuillRef = useRef(null);
  const inputOpenImageRef = useRef();
  const inputOpenVideoRef = useRef();
  const inputOpenAudioRef = useRef();

  const [editorHtml, setEditorHtml] = useState(content);

  const [isLoading, setIsLoading] = useState(false);

  const imageHandler = useCallback(() => {
    inputOpenImageRef.current.click();
  }, []);

  const videoHandler = useCallback(() => {
    inputOpenVideoRef.current.click();
  }, []);

  const audioHandler = useCallback(() => {
    inputOpenAudioRef.current.click();
  }, []);

  const imageUrlHandler = useCallback(() => {
    const quill = reactQuillRef.current.getEditor();
    let range = quill.getSelection();
    let position = range ? range.index : 0;

    const src = prompt("Enter the image URL");
    if (src) {
      quill.insertEmbed(position, "image", src, "user");
      quill.setSelection(position + 2);
    }
  }, []);

  const modules = {
    syntax: true,

    toolbar: {
      container: "#toolbar",
      handlers: {
        image: imageUrlHandler,
        insertImage: imageHandler,
        insertVideo: videoHandler,
        insertAudio: audioHandler,
      },
    },
    resize: {},
  };

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "align",
    "align-center",
    "align-right",
    "strike",
    "script",
    "blockquote",
    "background",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "audio",
    "image",
    "video",
    "audio",
  ];

  const awsBucketUrl =
    "https://quill-editor-blog-demo.s3.us-east-2.amazonaws.com";

  const insertFile = useCallback(async (e, type, awsBucketUrl) => {
    e.stopPropagation();
    e.preventDefault();

    if (
      e.currentTarget &&
      e.currentTarget.files &&
      e.currentTarget.files.length > 0
    ) {
      const file = e.currentTarget.files[0];

      // Get the pre-signed s3 url
      setIsLoading(true);

      const {
        data: { url, fileSource },
      } = await axios.post(`/api/v1/media/signedUrl`, {
        filename: file.name,
        courseId: "123",
      });
      console.log("pre-signed s3 bucket url:", url);

      // upload image to the signedUrl
      console.log("file to upload to S3: ", file);
      await axios.put(url, file, {
        headers: { "Content-Type": file.type },
      });
      setIsLoading(false);

      const quill = reactQuillRef.current.getEditor();
      quill.focus();
      let range = quill.getSelection();
      let position = range ? range.index : 0;

      const src = awsBucketUrl + "/" + file.name;

      if (type === "image") {
        quill.insertEmbed(
          position,
          "image",
          {
            src: src,
            alt: file.name,
          },
          "user"
        );
      } else if (type === "video") {
        quill.insertEmbed(
          position,
          "video",
          {
            src: src,
            title: file.name,
          },
          "user"
        );
      } else if (type === "audio") {
        quill.insertEmbed(position, "audio", { src: src }, "user");
      }

      quill.setSelection(position + 2);
    }
  }, []);

  // const insertFileBackend = useCallback((e, type) => {
  //   e.stopPropagation();
  //   e.preventDefault();

  //   if (
  //     e.currentTarget &&
  //     e.currentTarget.files &&
  //     e.currentTarget.files.length > 0
  //   ) {
  //     const file = e.currentTarget.files[0];

  //     let formData = new FormData();
  //     const config = {
  //       header: { "content-type": "multipart/form-data" },
  //     };
  //     formData.append("file", file);

  //     // approach 1: transmit file to backend -> backend uploads file to s3

  //     setIsLoading(true);
  //     axios.post("/api/blog/uploadfiles", formData, config).then((response) => {
  //       setIsLoading(false);

  //       if (response.data.success) {
  //         console.log("S3 file url: ", response.data.url);

  //         const quill = reactQuillRef.current.getEditor();
  //         quill.focus();

  //         let range = quill.getSelection();
  //         let position = range ? range.index : 0;
  //         if (type === "image") {
  //           quill.insertEmbed(position, "image", {
  //             src: response.data.url,
  //             alt: response.data.fileName,
  //           });
  //         } else if (type === "video") {
  //           quill.insertEmbed(position, "video", {
  //             src: response.data.url,
  //             title: response.data.fileName,
  //           });
  //         }

  //         quill.setSelection(position + 2);
  //       } else {
  //         return alert("failed to upload file");
  //       }
  //     });
  //   }
  // }, []);

  return (
    <div>
      <div id="toolbar">
        <span className="ql-formats">
          <select className="ql-header"></select>
        </span>
        <span className="ql-formats">
          <button className="ql-bold" />
          <button className="ql-italic" />
          <button className="ql-underline" />
          <button className="ql-strike" />
          <button className="ql-blockquote" />
        </span>
        <span className="ql-formats">
          <button className="ql-list" value="ordered" />
          <button className="ql-list" value="bullet" />
          <select className="ql-align" />
        </span>
        <span className="ql-formats">
          <button className="ql-link" />
          <button className="ql-image" />
          <button className="ql-video" />
          <button className="ql-audio">
            <Icon type="audio" style={{ marginBottom: "2px" }} />
          </button>
        </span>
        <span className="ql-formats">
          <button className="ql-insertImage">
            <Icon type="picture" theme="filled" style={{ fontSize: "16px" }} />
          </button>
          <button className="ql-insertVideo">
            <Icon
              type="video-camera"
              theme="filled"
              style={{ fontSize: "16px" }}
            />
          </button>
          <button className="ql-insertAudio">
            <Icon type="audio" theme="filled" style={{ fontSize: "16px" }} />
          </button>
        </span>
      </div>
      <Spin spinning={isLoading} tip="Uploading file...">
        <ReactQuill
          ref={reactQuillRef}
          theme="snow"
          onChange={(text, _, source) => {
            setEditorHtml(text);
            console.log(text);
            onContentChange(text, source);
          }}
          modules={modules}
          formats={formats}
          value={editorHtml}
        />
        <input
          type="file"
          accept="image/*"
          ref={inputOpenImageRef}
          style={{ display: "none" }}
          onChange={(e) => insertFile(e, "image", awsBucketUrl)}
        />
        <input
          type="file"
          accept="video/*"
          ref={inputOpenVideoRef}
          style={{ display: "none" }}
          onChange={(e) => insertFile(e, "video", awsBucketUrl)}
        />
        <input
          type="file"
          accept="audio/*"
          ref={inputOpenAudioRef}
          style={{ display: "none" }}
          onChange={(e) => insertFile(e, "audio", awsBucketUrl)}
        />
      </Spin>
    </div>
  );
};

export default QuillEditor;
