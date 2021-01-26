import React, { useEffect, useState, useRef, useCallback } from "react";
import ReactQuill, { Quill } from "react-quill";
import { Spin } from "antd";

import "react-quill/dist/quill.snow.css";
import axios from "axios";
import Resize from "quill-resize-module-fix";
const Embed = Quill.import("blots/block/embed");

Quill.register("modules/resize", Resize);

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

const QuillEditor = ({ onEditorChange, contentValue }) => {
  const reactQuillRef = useRef(null);
  const inputOpenImageRef = useRef();
  const inputOpenVideoRef = useRef();

  const [editorHtml, setEditorHtml] = useState(contentValue);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("contentValue:", contentValue);
    setEditorHtml(contentValue);
  }, []);

  useEffect(() => {
    console.log("editorHtml:", editorHtml);
    onEditorChange(editorHtml);
  }, [editorHtml, onEditorChange]);

  const imageHandler = useCallback(() => {
    inputOpenImageRef.current.click();
  }, []);

  const videoHandler = useCallback(() => {
    inputOpenVideoRef.current.click();
  }, []);

  const modules = {
    syntax: true,

    toolbar: {
      container: "#toolbar",
      handlers: {
        insertImage: imageHandler,
        insertVideo: videoHandler,
      },
    },
    resize: {},
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "image",
    "video",
    "link",
    "code-block",
    "video",
    "blockquote",
    "clean",
  ];

  const insertImageFrontend = useCallback(async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (
      e.currentTarget &&
      e.currentTarget.files &&
      e.currentTarget.files.length > 0
    ) {
      const file = e.currentTarget.files[0];

      // pre-signed s3 url approach : call backend to get a presigned s3 url -> frontend uploads file to s3

      // Get the pre-signed s3 url
      const { data: uploadConfig } = await axios.get(
        `/api/upload/signedUrl/${file.name}`
      );
      console.log("pre-signed s3 bucket url:", uploadConfig.url);

      // upload image to the signedUrl
      console.log("file to upload to S3: ", file);
      const config = {
        headers: { "Content-Type": file.type },
      };

      const response = await axios.put(uploadConfig.url, file, config);

      // console.log("response: ", response);
      console.log("uploaded file url: ", response.config.url);
      if (response.status === 200 && response.statusText === "OK") {
        const quill = reactQuillRef.current.getEditor();
        quill.focus();
        let range = quill.getSelection();
        let position = range ? range.index : 0;
        quill.insertEmbed(position, "image", {
          // "https://quill-editor-blog-demo.s3.us-east-2.amazonaws.com/marmot.jpg?Content-Type=jpg&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIATVR3K3RS5AARKG4L%2F20210126%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20210126T023151Z&X-Amz-Expires=900&X-Amz-Signature=6dd334f103aa622b2190fb14ee0199f59a01a17411b456934a4d1738358492fd&X-Amz-SignedHeaders=host"
          src:
            "https://quill-editor-blog-demo.s3.us-east-2.amazonaws.com/" +
            response.config.data.name,
          alt: response.config.data.name,
        });
        quill.setSelection(position + 2);
      } else {
        return alert("failed to upload file");
      }
    }
  }, []);

  // const insertImageBackend = useCallback((e) => {
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
  //     axios.post("/api/blog/uploadfiles", formData, config).then((response) => {
  //       if (response.data.success) {
  //         console.log("S3 file url: ", response.data.url);

  //         const quill = reactQuillRef.current.getEditor();
  //         quill.focus();

  //         let range = quill.getSelection();
  //         let position = range ? range.index : 0;

  //         quill.insertEmbed(position, "image", {
  //           src: response.data.url,
  //           alt: response.data.fileName,
  //         });
  //         quill.setSelection(position + 2);
  //       } else {
  //         return alert("failed to upload file");
  //       }
  //     });
  //   }
  // }, []);

  // const insertVideoBackend = useCallback(async (e) => {
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

  //     const startTime = Date.now();

  //     axios.post("/api/blog/uploadfiles", formData, config).then((response) => {
  //       const endTime = Date.now();
  //       const timeElapsed = endTime - startTime; // time in milliseconds
  //       console.log(
  //         "time elapased with backend-heavy approach: ",
  //         timeElapsed / 1000,
  //         "sec"
  //       );

  //       if (response.data.success) {
  //         const quill = reactQuillRef.current.getEditor();
  //         quill.focus();

  //         let range = quill.getSelection();
  //         let position = range ? range.index : 0;
  //         quill.insertEmbed(position, "video", {
  //           src: response.data.url,
  //           title: response.data.fileName,
  //         });
  //         quill.setSelection(position + 2);
  //       } else {
  //         return alert("failed to upload file");
  //       }
  //     });
  //   }
  // }, []);

  const insertVideoFrontend = useCallback(async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (
      e.currentTarget &&
      e.currentTarget.files &&
      e.currentTarget.files.length > 0
    ) {
      const file = e.currentTarget.files[0];

      // approach 2: call backend to get a presigned s3 url -> frontend uploads file to s3
      const { data: uploadConfig } = await axios.get(
        `/api/upload/signedUrl/${file.name}`
      );
      console.log("pre-signed s3 bucket url:", uploadConfig.url);

      // upload video to the signedUrl
      console.log("file to upload to S3: ", file);
      const config = {
        headers: { "Content-Type": file.type },
      };

      setIsLoading(true);
      axios.put(uploadConfig.url, file, config).then((response) => {
        setIsLoading(false);

        if (response.status === 200 && response.statusText === "OK") {
          const quill = reactQuillRef.current.getEditor();
          quill.focus();
          let range = quill.getSelection();
          let position = range ? range.index : 0;
          quill.insertEmbed(position, "video", {
            src:
              "https://quill-editor-blog-demo.s3.us-east-2.amazonaws.com/" +
              response.config.data.name,
            title: response.config.data.name,
          });
          quill.setSelection(position + 2);
        } else {
          return alert("failed to upload file");
        }
      });
    }
  }, []);

  return (
    <div>
      <div id="toolbar">
        <select
          className="ql-header"
          defaultValue={""}
          onChange={(e) => e.persist()}
        >
          <option value="1" />
          <option value="2" />
          <option value="" />
        </select>
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-underline" />
        <button className="ql-strike" />
        <button className="ql-insertImage">I</button>
        <button className="ql-insertVideo">V</button>
        <button className="ql-link" />
        <button className="ql-code-block" />
        <button className="ql-video" />
        <button className="ql-blockquote" />
        <button className="ql-clean" />
      </div>
      <Spin spinning={isLoading} tip="Uploading file...">
        <ReactQuill
          ref={reactQuillRef}
          theme="snow"
          onChange={(html) => {
            console.log("onChange:", html);
            setEditorHtml(html);
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
          onChange={insertImageFrontend}
        />
        <input
          type="file"
          accept="video/*"
          ref={inputOpenVideoRef}
          style={{ display: "none" }}
          onChange={insertVideoFrontend}
        />
      </Spin>
    </div>
  );
};

export default QuillEditor;
