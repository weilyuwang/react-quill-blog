import React, { useEffect, useState, useRef, useCallback } from "react";
import ReactQuill, { Quill } from "react-quill";

import "react-quill/dist/quill.snow.css";
import axios from "axios";
import Resize, { EmbedPlaceholder } from "quill-resize-module-fix";
Quill.register("modules/resize", Resize);

class ImageBlot extends EmbedPlaceholder {
  static create(value) {
    const imgTag = super.create();
    imgTag.setAttribute("src", value.src);
    imgTag.setAttribute("alt", value.alt);
    imgTag.setAttribute("width", "100%");

    console.log("imgTag:", imgTag);
    return imgTag;
  }

  static value(node) {
    return { src: node.getAttribute("src"), alt: node.getAttribute("alt") };
  }
}
ImageBlot.blotName = "image";
ImageBlot.tagName = "img";
Quill.register(ImageBlot);

class VideoBlot extends EmbedPlaceholder {
  static create(value) {
    if (value && value.src) {
      const videoTag = super.create();
      videoTag.setAttribute("src", value.src);
      videoTag.setAttribute("title", value.title);
      videoTag.setAttribute("width", "100%");
      videoTag.setAttribute("controls", "");

      console.log("videoTag:", videoTag);
      return videoTag;
    } else {
      const iframeTag = document.createElement("iframe");
      iframeTag.setAttribute("src", value);
      iframeTag.setAttribute("frameborder", "0");
      iframeTag.setAttribute("allowfullscreen", true);
      iframeTag.setAttribute("width", "100%");
      return iframeTag;
    }
  }

  static value(node) {
    if (node.getAttribute("title")) {
      return { src: node.getAttribute("src"), alt: node.getAttribute("title") };
    } else {
      return node.getAttribute("src");
    }
  }
}
VideoBlot.blotName = "video";
VideoBlot.tagName = "video";
Quill.register(VideoBlot);

const QuillEditor = ({ onEditorChange }) => {
  const reactQuillRef = useRef(null);
  const inputOpenImageRef = useRef();
  const inputOpenVideoRef = useRef();

  const [editorHtml, setEditorHtml] = useState(null);

  useEffect(() => {
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

  const insertImage = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();

    if (
      e.currentTarget &&
      e.currentTarget.files &&
      e.currentTarget.files.length > 0
    ) {
      const file = e.currentTarget.files[0];

      let formData = new FormData();
      const config = {
        header: { "content-type": "multipart/form-data" },
      };
      formData.append("file", file);

      // approach 1: transmit file to backend -> backend uploads file to s3
      axios.post("/api/blog/uploadfiles", formData, config).then((response) => {
        if (response.data.success) {
          const quill = reactQuillRef.current.getEditor();
          quill.focus();

          let range = quill.getSelection();
          let position = range ? range.index : 0;

          quill.insertEmbed(position, "image", {
            src: response.data.url,
            alt: response.data.fileName,
          });
          quill.setSelection(position + 2);
        } else {
          return alert("failed to upload file");
        }
      });
    }
  }, []);

  const insertVideoBackend = useCallback(async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (
      e.currentTarget &&
      e.currentTarget.files &&
      e.currentTarget.files.length > 0
    ) {
      const file = e.currentTarget.files[0];

      let formData = new FormData();
      const config = {
        header: { "content-type": "multipart/form-data" },
      };
      formData.append("file", file);

      // approach 1: transmit file to backend -> backend uploads file to s3

      const startTime = Date.now();

      axios.post("/api/blog/uploadfiles", formData, config).then((response) => {
        if (response.data.success) {
          const quill = reactQuillRef.current.getEditor();
          quill.focus();

          let range = quill.getSelection();
          let position = range ? range.index : 0;
          quill.insertEmbed(position, "video", {
            src: "http://localhost:5000/" + response.data.url,
            title: response.data.fileName,
          });
          quill.setSelection(position + 2);
        } else {
          return alert("failed to upload file");
        }
      });

      const endTime = Date.now();
      const timeElapsed = endTime - startTime; // time in milliseconds
      console.log("time elapased with backend-heavy approach: ", timeElapsed);
    }
  }, []);

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

      const startTime = Date.now();
      const { data: uploadConfig } = await axios.get(
        `/api/upload/signedUrl/${file.name}`
      );
      console.log("signedUrl:", uploadConfig.url);

      // upload video to the signedUrl
      console.log("file to upload to S3: ", file);
      const config = {
        headers: { "Content-Type": file.type },
      };
      axios.put(uploadConfig.url, file, config).then((response) => {
        console.log(response.data);
        if (response.data.success) {
          // const quill = reactQuillRef.current.getEditor();
          // quill.focus();
          // let range = quill.getSelection();
          // let position = range ? range.index : 0;
          // quill.insertEmbed(position, "video", {
          //   src: "http://localhost:5000/" + response.data.url,
          //   title: response.data.fileName,
          // });
          // quill.setSelection(position + 2);
        } else {
          return alert("failed to upload file");
        }
      });
      const endTime = Date.now();
      const timeElapsed = endTime - startTime; // time in milliseconds
      console.log(
        "time elapased with frontend-heavy approach: ",
        timeElapsed,
        "ms"
      );
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
        onChange={insertImage}
      />
      <input
        type="file"
        accept="video/*"
        ref={inputOpenVideoRef}
        style={{ display: "none" }}
        onChange={insertVideoFrontend}
      />
    </div>
  );
};

export default QuillEditor;
