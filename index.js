const NodeMediaServer = require("node-media-server");
const fs = require("fs");
const path = require("path");

const httpConfig = {
  port: 8000,
  allow_origin: "*",
  mediaroot: "./media",
};

const rtmpConfig = {
  port: 1935,
  chunk_size: 600,
  gop_cache: true,
  ping: 10,
  ping_timeout: 60,
};

const transformationConfig = {
  ffmpeg: "/usr/local/bin/ffmpeg",
  tasks: [
    {
      app: "live",
      hls: true,
      hlsFlags: "[hls_time=2:hls_list_size=5:hls_flags=delete_segments]",
      hlsKeep: false,
      // Adaptive Bitrate Streaming with MP4 output
      hlsVariants: [
        {
          name: "low",
          bitrate: 250000, // Lower bitrate for reduced file size
          resolution: "640x360",
        },
        {
          name: "medium",
          bitrate: 500000,
          resolution: "1280x720",
        },
      ],
    },
  ],
  MediaRoot: "./media",
};

const config = {
  http: httpConfig,
  rtmp: rtmpConfig,
  trans: transformationConfig,
};

const nms = new NodeMediaServer(config);

// Function to manage saved files
const manageSavedFiles = (directory) => {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    // Filter for MP4 files and sort by creation date
    const mp4Files = files
      .filter(file => path.extname(file) === ".mp4")
      .map(file => path.join(directory, file))
      .sort((a, b) => fs.statSync(b).birthtime - fs.statSync(a).birthtime);

    // Keep only the latest two files
    if (mp4Files.length > 2) {
      const filesToDelete = mp4Files.slice(2);
      filesToDelete.forEach(file => {
        fs.unlink(file, (err) => {
          if (err) console.error(`Error deleting file ${file}:`, err);
        });
      });
    }
  });
};

// Run the server and manage saved files
nms.run();
setInterval(() => manageSavedFiles(httpConfig.mediaroot), 60000); // Check every minute
