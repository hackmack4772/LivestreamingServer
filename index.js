const NodeMediaServer = require("node-media-server");

const httpConfig = {
  port: 8000, // HTTP port
  allow_origin: "*", // Allow requests from any origin
  mediaroot: "./media", // Directory where the server will look for media files
};

const rtmpConfig = {
  port: 1935, // RTMP port
  chunk_size: 600, // Reduced chunk size for faster loading (in bytes)
  gop_cache: true, // Use GOP cache for efficiency
  ping: 10, // Ping interval in seconds
  ping_timeout: 60, // Ping timeout in seconds
};

const transformationConfig = {
  ffmpeg: "/usr/local/bin/ffmpeg",
  tasks: [
    {
      app: "live",
      hls: true,
      hlsFlags: "[hls_time=2:hls_list_size=5:hls_flags=delete_segments]",
      hlsKeep: false,
      // Adaptive Bitrate Streaming
      hlsVariants: [
        {
          name: "low",
          bitrate: 500000, // Low bitrate variant
          resolution: "640x360", // Resolution for low variant
        },
        {
          name: "medium",
          bitrate: 1000000, // Medium bitrate variant
          resolution: "1280x720", // Resolution for medium variant
        },
        {
          name: "high",
          bitrate: 2500000, // High bitrate variant
          resolution: "1920x1080", // Resolution for high variant
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

nms.run();
