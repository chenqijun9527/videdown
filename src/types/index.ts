export interface VideoFormat {
  formatId: string
  quality: string
  ext: string
  filesize?: number
  width?: number
  height?: number
  fps?: number
  hasAudio?: boolean
  url?: string  // 直接下载链接（用于抖音等平台）
  audioUrl?: string  // 分离的音频流直链（抖音 CDP 拦截，下载后需与 url 合并）
}

export interface AudioTrack {
  id: string
  name: string
  language: string
  formatId: string
  isM3u8?: boolean
}

export interface SubtitleInfo {
  language: string
  name: string
  url: string
}

export interface AudioFormat {
  formatId: string
  quality: string
  ext: string
  filesize?: number
  abr?: number
  acodec?: string
}

export interface VideoInfo {
  id: string
  title: string
  description?: string
  thumbnail: string
  duration?: number
  uploader?: string
  webpageUrl: string
  formats: VideoFormat[]
  audioTracks?: AudioTrack[]
  subtitles?: SubtitleInfo[]
  audioFormats?: AudioFormat[]
  isYoutube?: boolean
  isBatch?: boolean
  batchVideos?: BatchVideo[]
  batchTab?: string  // 批量枚举来源：post（作品）/ like（喜欢）/ favorite_collection（收藏）
  loginWall?: boolean  // 未登录受限：抖音只展示第一页作品
  totalWorks?: number  // 作者总作品数（从 tab 文本提取）
}

// 批量下载的视频条目（抖音主页枚举结果）
export interface BatchVideo {
  id: string
  title: string
  cover?: string
  duration?: number
  url: string
  directUrl?: string
  diggCount?: number    // 点赞数
  collectCount?: number // 收藏数
  commentCount?: number // 评论数
  createTime?: number   // 发布时间（秒级时间戳）
}

export interface DownloadTask {
  id: string
  url: string
  videoInfo: VideoInfo
  selectedFormat: VideoFormat
  outputDir: string
  status: 'pending' | 'downloading' | 'paused' | 'merging' | 'completed' | 'error'
  progress: number
  downloadedSize?: string
  totalSize?: string
  speed?: string
  eta?: string
  error?: string
  filePath?: string
  statusMessage?: string
  createdAt: string
}

export interface HistoryRecord {
  id: string
  title: string
  thumbnail: string
  url: string
  filePath: string
  format: string
  quality: string
  fileSize?: string
  createdAt: string
}

export type TabType = 'download' | 'history' | 'about' | 'settings'
