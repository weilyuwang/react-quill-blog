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

const QuillEditor = ({ onContentChange, content }) => {
  const reactQuillRef = useRef(null);
  const inputOpenImageRef = useRef();
  const inputOpenVideoRef = useRef();

  const [editorHtml, setEditorHtml] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  // initial content
  useEffect(() => {
    setEditorHtml(content);
  }, [content]);

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
      const { data: uploadConfig } = await axios.get(
        `/api/upload/signedUrl/${file.name}`
      );
      console.log("pre-signed s3 bucket url:", uploadConfig.url);

      // upload image to the signedUrl
      console.log("file to upload to S3: ", file);
      const config = {
        headers: { "Content-Type": file.type },
      };

      setIsLoading(true);
      const response = await axios.put(uploadConfig.url, file, config);
      setIsLoading(false);
      // console.log("response: ", response);
      console.log("uploaded file url: ", response.config.url);
      if (response.status === 200 && response.statusText === "OK") {
        const quill = reactQuillRef.current.getEditor();
        quill.focus();
        let range = quill.getSelection();
        let position = range ? range.index : 0;

        const src = awsBucketUrl + "/" + response.config.data.name;

        if (type === "image") {
          quill.insertEmbed(position, "image", {
            src: src,
            alt: response.config.data.name,
          });
        } else if (type === "video") {
          quill.insertEmbed(position, "video", {
            src: src,
            title: response.config.data.name,
          });
        }

        quill.setSelection(position + 2);
      } else {
        return alert("failed to upload file");
      }
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
          onChange={(text, _, source) => {
            setEditorHtml(text);
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
      </Spin>
    </div>
  );
};

export default QuillEditor;
