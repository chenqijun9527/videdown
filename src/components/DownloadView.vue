<template>
  <div class="flex-1 flex overflow-hidden">
    <!-- Left Panel -->
    <section class="w-[65%] flex flex-col bg-surface relative">
      <div class="flex-1 overflow-y-auto px-8 py-6">
        <div class="max-w-xl mx-auto w-full flex flex-col gap-6">
          <!-- Title -->
          <div class="flex flex-col gap-1">
            <h1 class="font-headline text-2xl font-bold leading-tight text-on-surface">全平台视频下载VIDEO</h1>
            <p class="text-on-surface-variant text-sm">输入链接即刻解析高清数字资产</p>
          </div>
          
          <!-- URL Input -->
          <div class="flex flex-col gap-3">
            <div class="relative">
              <textarea 
                ref="urlInput"
                v-model="url"
                aria-label="Paste video URL here" 
                class="w-full h-24 bg-surface-container-highest rounded-md p-3 text-on-surface placeholder:text-outline-variant resize-none font-body text-sm border-2 border-transparent focus:border-primary focus:outline-none transition-all"
                placeholder="在此处粘贴需要解析的视频链接..."
                @contextmenu.prevent="showContextMenu"
              />
              <!-- Context Menu -->
              <div 
                v-if="contextMenuVisible" 
                class="absolute z-50 bg-surface-container-high rounded-lg shadow-lg border border-outline-variant/20 py-1 min-w-[120px]"
                :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
              >
                <button 
                  class="w-full px-4 py-2 text-left text-sm text-on-surface hover:bg-surface-container-highest transition-colors flex items-center gap-2"
                  @click="handleContextMenuAction('cut')"
                >
                  <MaterialIcon name="content_cut" :size="16" />
                  <span>剪切</span>
                </button>
                <button 
                  class="w-full px-4 py-2 text-left text-sm text-on-surface hover:bg-surface-container-highest transition-colors flex items-center gap-2"
                  @click="handleContextMenuAction('copy')"
                >
                  <MaterialIcon name="content_copy" :size="16" />
                  <span>复制</span>
                </button>
                <button 
                  class="w-full px-4 py-2 text-left text-sm text-on-surface hover:bg-surface-container-highest transition-colors flex items-center gap-2"
                  @click="handleContextMenuAction('paste')"
                >
                  <MaterialIcon name="content_paste" :size="16" />
                  <span>粘贴</span>
                </button>
                <div class="h-px bg-outline-variant/20 my-1"></div>
                <button 
                  class="w-full px-4 py-2 text-left text-sm text-on-surface hover:bg-surface-container-highest transition-colors flex items-center gap-2"
                  @click="handleContextMenuAction('delete')"
                >
                  <MaterialIcon name="delete" :size="16" />
                  <span>删除</span>
                </button>
                <button 
                  class="w-full px-4 py-2 text-left text-sm text-on-surface hover:bg-surface-container-highest transition-colors flex items-center gap-2"
                  @click="handleContextMenuAction('selectAll')"
                >
                  <MaterialIcon name="select_all" :size="16" />
                  <span>全选</span>
                </button>
              </div>
            </div>
            <!-- 解析模式选择 -->
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] text-on-surface-variant">解析模式：</span>
              <button
                v-for="m in parseModes"
                :key="m.value"
                class="px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-colors"
                :class="parseMode === m.value
                  ? 'bg-primary-container text-on-primary-container border-primary/40'
                  : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:border-primary/40'"
                :disabled="isParsing"
                :title="m.tip"
                @click="parseMode = m.value"
              >
                {{ m.label }}
              </button>
            </div>
            <div class="flex gap-3">
              <button
                class="flex-1 flex items-center justify-center gap-2 rounded-md h-10 bg-surface-container-highest text-on-surface font-headline font-semibold text-sm hover:bg-surface-variant transition-colors border border-outline-variant/10"
                @click="pasteUrl"
              >
                <MaterialIcon name="content_paste" :size="18" />
                <span>粘贴链接</span>
              </button>
              <button
                class="flex-[1.5] flex items-center justify-center gap-2 rounded-md h-10 font-headline font-semibold text-sm transition-all border-2 bg-tertiary-container/40 text-tertiary border-tertiary/30 hover:bg-tertiary-container/60 hover:border-tertiary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isParsing"
                @click="parseVideo"
              >
                <MaterialIcon v-if="isParsing" name="sync" :size="18" class="animate-spin" />
                <MaterialIcon v-else name="bolt" :size="18" />
                <span>{{ isParsing ? '解析中...' : '解析视频信息' }}</span>
              </button>
            </div>
          </div>
          
          <!-- YouTube Cookie Hint -->
          <div v-if="isYouTubeUrl && !hasParsed" class="flex flex-col gap-2 p-4 bg-tertiary-container/30 rounded-lg border border-tertiary/20">
            <div class="flex items-start gap-3">
              <MaterialIcon name="info" :size="20" class="text-tertiary flex-shrink-0 mt-0.5" />
              <div class="flex-1">
                <p class="text-sm font-medium text-on-surface">YouTube 视频需要 Cookie 才能下载</p>
                <p class="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  由于 YouTube 的限制，需安装 Chrome 插件
                  <span class="font-medium text-tertiary">Get cookies.txt LOCALLY</span>
                  导出 cookies 文件命名为 cookies.txt，然后在设置中导入并且需要经常更新cookies.txt。
                </p>
                <button 
                  @click="openCookieHelp"
                  class="mt-2 text-xs text-tertiary hover:text-tertiary/80 underline underline-offset-2 transition-colors"
                >
                  查看详细教程
                </button>
              </div>
            </div>
          </div>

          <!-- Bilibili Cookie Hint -->
          <div v-if="showBilibiliCookieHint && !hasParsed" class="flex flex-col gap-2 p-4 bg-tertiary-container/30 rounded-lg border border-tertiary/20">
            <div class="flex items-start gap-3">
              <MaterialIcon name="info" :size="20" class="text-tertiary flex-shrink-0 mt-0.5" />
              <div class="flex-1">
                <p class="text-sm font-medium text-on-surface">B站视频需要 Cookie 才能下载</p>
                <p class="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  由于 B站的限制，需要导入 cookies.txt 文件才能下载完整视频。
                </p>
                <button 
                  @click="goToSettings"
                  class="mt-2 flex items-center gap-1 text-xs text-tertiary hover:text-tertiary/80 underline underline-offset-2 transition-colors"
                >
                  <MaterialIcon name="settings" :size="14" />
                  <span>去设置导入 Cookie</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Supported Platforms -->
          <div class="flex flex-col gap-2 mt-2">
            <span class="text-[10px] font-bold text-outline uppercase tracking-[0.1em] ml-1">支持解析平台</span>
            <div class="flex items-center gap-4 px-4 py-2.5 bg-surface-container-low rounded-lg border border-outline-variant/10">
              <div v-for="platform in platforms" :key="platform.name" class="flex items-center gap-2 transition-all cursor-default">
                <MaterialIcon :name="platform.icon" :size="18" class="text-primary" :weight="200"/>
                <span class="text-[11px] font-medium text-on-surface-variant">{{ platform.name }}</span>
              </div>
            </div>
          </div>
          
          <!-- Batch Download Panel (抖音主页枚举) -->
          <div v-if="batchResult" class="mt-2 flex flex-col gap-3">
            <div class="flex items-center justify-between border-b border-outline-variant/20 pb-2">
              <h3 class="font-headline text-sm font-bold text-on-surface">
                批量下载 - {{ batchResult.title }}（共 {{ batchResult.batchVideos?.length || 0 }} 个）
              </h3>
              <div class="flex items-center gap-2">
                <button
                  class="px-2 py-1 text-[11px] font-semibold rounded-md bg-surface-container-highest text-on-surface hover:bg-surface-variant transition-colors"
                  @click="toggleBatchSelectAll"
                >
                  {{ batchAllSelected ? '取消全选' : '全选' }}
                </button>
                <button
                  class="p-1 text-on-surface-variant hover:text-error transition-colors"
                  @click="clearBatchResult"
                  title="关闭批量面板"
                >
                  <MaterialIcon name="close" :size="16" />
                </button>
              </div>
            </div>

            <!-- 登录墙提示：未登录只能看第一页 -->
            <div v-if="batchResult.loginWall" class="flex items-start gap-2 p-3 bg-amber-container/30 rounded-md border border-amber/30">
              <MaterialIcon name="info" :size="16" class="text-amber flex-shrink-0 mt-0.5" />
              <p class="text-xs text-on-surface leading-relaxed">
                未登录状态抖音只开放第一页作品
                <template v-if="batchResult.totalWorks">（已获取 {{ batchResult.batchVideos?.length || 0 }} / {{ batchResult.totalWorks }} 个）</template>。
                用 Get cookies.txt 插件在已登录的抖音网页导出 cookies，到设置中导入后重新解析，即可获取全部作品。
                <button
                  class="ml-1 text-amber underline underline-offset-2 hover:text-amber/80 transition-colors"
                  @click="goToSettings"
                >去设置导入</button>
              </p>
            </div>

            <!-- 列表来源切换：作品 / 喜欢 / 收藏 + 排序 -->
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[11px] text-on-surface-variant">列表来源：</span>
              <button
                v-for="tab in batchTabs"
                :key="tab.value"
                class="px-3 py-1 text-[11px] font-semibold rounded-full border transition-colors"
                :class="activeBatchTab === tab.value
                  ? 'bg-primary-container text-on-primary-container border-primary/40'
                  : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:border-primary/40'"
                :disabled="isParsing"
                @click="switchBatchTab(tab.value)"
              >
                {{ tab.label }}
              </button>
              <span class="text-[11px] text-on-surface-variant ml-auto">排序：</span>
              <button
                class="px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-colors"
                :class="batchSortMode === 'hot'
                  ? 'bg-primary-container text-on-primary-container border-primary/40'
                  : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:border-primary/40'"
                @click="setBatchSort('hot')"
              >
                热度
              </button>
              <button
                class="px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-colors"
                :class="batchSortMode === 'time'
                  ? 'bg-primary-container text-on-primary-container border-primary/40'
                  : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:border-primary/40'"
                @click="setBatchSort('time')"
              >
                时间
              </button>
            </div>

            <div class="flex items-center justify-between gap-2 flex-wrap">
              <div class="flex items-center gap-1.5">
                <span class="text-[11px] font-mono text-on-surface-variant">已选 {{ selectedBatchIds.size }} 个</span>
                <span class="text-[11px] text-on-surface-variant ml-1">勾选前</span>
                <input
                  v-model="batchSelectCount"
                  type="text"
                  inputmode="numeric"
                  placeholder="全部"
                  class="w-14 px-1.5 py-0.5 text-[11px] font-mono rounded border border-outline-variant/30 bg-surface-container-lowest text-on-surface outline-none focus:border-primary/50"
                  @input="applyBatchSelectCount"
                />
                <span class="text-[11px] text-on-surface-variant">个</span>
              </div>
              <button
                class="flex items-center gap-2 px-4 py-2 rounded-md h-9 font-headline font-semibold text-sm transition-all border-2 bg-tertiary-container/40 text-tertiary border-tertiary/30 hover:bg-tertiary-container/60 hover:border-tertiary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="selectedBatchIds.size === 0 || isBatchDownloading"
                @click="startBatchDownload"
              >
                <MaterialIcon v-if="isBatchDownloading" name="sync" :size="16" class="animate-spin" />
                <MaterialIcon v-else name="download" :size="16" />
                <span>{{ isBatchDownloading ? '批量下载中...' : '下载选中视频' }}</span>
              </button>
            </div>

            <div class="flex flex-col gap-1 max-h-96 overflow-y-auto pr-1">
              <label
                v-for="item in batchResult.batchVideos"
                :key="item.id"
                class="flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors border"
                :class="selectedBatchIds.has(item.id) ? 'bg-surface-container-highest/50 border-primary/30' : 'bg-surface-container-lowest border-outline-variant/20 hover:border-primary/40'"
                @click="toggleBatchItem(item.id)"
              >
                <div
                  class="size-4 rounded-sm border-2 flex-shrink-0"
                  :class="selectedBatchIds.has(item.id) ? 'border-primary bg-primary' : 'border-outline-variant bg-surface'"
                />
                <div
                  class="w-16 h-10 rounded-sm bg-surface-variant bg-cover bg-center flex-shrink-0"
                  :style="{ backgroundImage: `url(${item.cover})` }"
                />
                <span class="text-xs text-on-surface line-clamp-1 flex-1">{{ item.title }}</span>
                <span v-if="item.qualityLabel" class="text-[10px] font-mono font-bold text-tertiary bg-tertiary-container/40 px-1 rounded-sm flex-shrink-0" :title="`下载清晰度 ${item.qualityLabel}`">
                  {{ item.qualityLabel }}
                </span>
                <span v-if="item.diggCount" class="text-[10px] font-mono text-primary flex-shrink-0 flex items-center gap-0.5" :title="`点赞 ${item.diggCount}`">
                  <MaterialIcon name="favorite" :size="11" />{{ formatCount(item.diggCount) }}
                </span>
                <span v-if="item.collectCount" class="text-[10px] font-mono text-tertiary flex-shrink-0" :title="`收藏 ${item.collectCount}`">
                  {{ formatCount(item.collectCount) }}★
                </span>
                <span v-if="item.duration" class="text-[10px] font-mono text-on-surface-variant flex-shrink-0">
                  {{ formatDuration(item.duration) }}
                </span>
              </label>
            </div>
          </div>

          <!-- Preview Section -->
          <div v-if="videoInfo" class="mt-2 flex flex-col gap-4">
            <h3 class="font-headline text-sm font-bold text-on-surface border-b border-outline-variant/20 pb-2">解析结果预览</h3>
            
            <!-- Video Info Card -->
            <div class="flex gap-4 p-3 bg-surface-container-low rounded-md border border-outline-variant/10">
              <div 
                class="w-40 h-24 rounded-sm bg-surface-variant bg-cover bg-center flex-shrink-0 relative overflow-hidden shadow-sm"
                :style="{ backgroundImage: `url(${videoInfo.thumbnail})` }"
              >
                <div v-if="videoInfo.duration" class="absolute bottom-1 right-1 bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface text-[10px] font-mono px-1 rounded-sm">
                  {{ formatDuration(videoInfo.duration) }}
                </div>
              </div>
              <div class="flex flex-col flex-1 justify-between py-0.5">
                <div>
                  <h4 class="font-headline text-sm font-bold text-on-surface leading-snug line-clamp-2">{{ videoInfo.title }}</h4>
                  <p v-if="videoInfo.uploader" class="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                    <MaterialIcon name="account_circle" :size="14" />
                    <span>{{ videoInfo.uploader }}</span>
                  </p>
                </div>
                <div class="flex items-center gap-3 text-[11px] text-on-surface-variant font-mono">
                  <span v-if="videoInfo.duration" class="flex items-center gap-1">
                    <MaterialIcon name="schedule" :size="14" />
                    {{ formatDuration(videoInfo.duration) }}
                  </span>
                  <span v-if="selectedFormat?.filesize" class="flex items-center gap-1">
                    <MaterialIcon name="database" :size="14" />
                    {{ formatFileSize(selectedFormat.filesize) }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Format Selection - Two Column Layout -->
            <div class="flex flex-col gap-2">
              <span class="text-[11px] font-bold text-outline uppercase tracking-wider">视频格式 (MP4) - 共 {{ videoInfo.formats?.length || 0 }} 个</span>
              <div class="grid grid-cols-2 gap-2">
                <label 
                  v-for="format in videoInfo.formats" 
                  :key="format.formatId"
                  class="flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors"
                  :class="selectedFormat?.formatId === format.formatId ? 'bg-surface-container-highest/50 border border-primary/30 hover:bg-primary-container/20' : 'bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/40'"
                  @click="selectVideoFormat(format)"
                >
                  <div class="flex items-center gap-2">
                    <div 
                      class="size-4 rounded-full border-4 flex-shrink-0"
                      :class="selectedFormat?.formatId === format.formatId ? 'border-primary bg-surface' : 'border-outline-variant bg-surface'"
                    />
                    <span class="text-xs font-semibold" :class="selectedFormat?.formatId === format.formatId ? 'text-on-surface' : 'text-on-surface font-medium'">{{ format.quality }}</span>
                  </div>
                  <span class="text-[10px] font-mono text-on-surface-variant">{{ format.filesize ? formatFileSize(format.filesize) : '未知大小' }}</span>
                </label>
              </div>
            </div>
            
            <!-- YouTube Audio Formats -->
            <div v-if="videoInfo.isYoutube === true && videoInfo.audioFormats?.length" class="flex flex-col gap-2">
              <span class="text-[11px] font-bold text-outline uppercase tracking-wider">纯音频格式 - 共 {{ videoInfo.audioFormats.length }} 个</span>
              <div class="grid grid-cols-2 gap-2">
                <label 
                  v-for="format in videoInfo.audioFormats" 
                  :key="format.formatId"
                  class="flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors"
                  :class="selectedAudioFormat?.formatId === format.formatId ? 'bg-surface-container-highest/50 border border-primary/30 hover:bg-primary-container/20' : 'bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/40'"
                  @click="selectAudioFormat(format)"
                >
                  <div class="flex items-center gap-2">
                    <div 
                      class="size-4 rounded-full border-4 flex-shrink-0"
                      :class="selectedAudioFormat?.formatId === format.formatId ? 'border-primary bg-surface' : 'border-outline-variant bg-surface'"
                    />
                    <span class="text-xs font-semibold" :class="selectedAudioFormat?.formatId === format.formatId ? 'text-on-surface' : 'text-on-surface font-medium'">{{ format.quality }}</span>
                  </div>
                  <span class="text-[10px] font-mono text-on-surface-variant">{{ format.filesize ? formatFileSize(format.filesize) : '未知大小' }}</span>
                </label>
              </div>
            </div>
            
            <!-- YouTube Audio Tracks -->
            <div v-if="videoInfo.isYoutube === true && videoInfo.audioTracks?.length" class="flex flex-col gap-2">
              <span class="text-[11px] font-bold text-outline uppercase tracking-wider">音频轨道 - 共 {{ videoInfo.audioTracks.length }} 个</span>
              <div class="grid grid-cols-2 gap-2">
                <label 
                  v-for="track in videoInfo.audioTracks" 
                  :key="track.id"
                  class="flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors"
                  :class="selectedAudioTrack?.id === track.id ? 'bg-surface-container-highest/50 border border-primary/30 hover:bg-primary-container/20' : 'bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/40'"
                  @click="selectAudioTrack(track)"
                >
                  <div class="flex items-center gap-2">
                    <div 
                      class="size-4 rounded-full border-4 flex-shrink-0"
                      :class="selectedAudioTrack?.id === track.id ? 'border-primary bg-surface' : 'border-outline-variant bg-surface'"
                    />
                    <span class="text-xs font-semibold" :class="selectedAudioTrack?.id === track.id ? 'text-on-surface' : 'text-on-surface font-medium'">{{ track.name }}</span>
                  </div>
                  <span class="text-[10px] font-mono text-on-surface-variant">{{ track.language }}</span>
                </label>
              </div>
            </div>
            
            <!-- YouTube Subtitles -->
            <div v-if="videoInfo.isYoutube === true && videoInfo.subtitles?.length" class="flex flex-col gap-2">
              <span class="text-[11px] font-bold text-outline uppercase tracking-wider">字幕 - 共 {{ videoInfo.subtitles.length }} 个</span>
              <div class="flex flex-wrap gap-2">
                <label 
                  v-for="sub in videoInfo.subtitles" 
                  :key="sub.language"
                  class="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors"
                  :class="selectedSubtitles.includes(sub.language) ? 'bg-surface-container-highest/50 border border-primary/30 hover:bg-primary-container/20' : 'bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/40'"
                  @click="selectSubtitle(sub.language)"
                >
                  <div 
                    class="size-3 rounded-sm border-2 flex-shrink-0"
                    :class="selectedSubtitles.includes(sub.language) ? 'border-primary bg-primary' : 'border-outline-variant bg-surface'"
                  />
                  <span class="text-xs font-semibold" :class="selectedSubtitles.includes(sub.language) ? 'text-on-surface' : 'text-on-surface font-medium'">{{ sub.name }}</span>
                </label>
              </div>
            </div>
            
            <!-- Download Button -->
            <button 
              class="w-full flex items-center justify-center gap-2 rounded-xl h-12 font-headline font-bold text-base shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 mt-4 text-on-primary-fixed gradient-btn-orange"
              :disabled="(!selectedFormat && !selectedAudioFormat && selectedSubtitles.length === 0) || isDownloading"
              @click="startDownload"
            >
              <MaterialIcon v-if="isDownloading" name="sync" :size="24" class="animate-spin" />
              <MaterialIcon v-else name="download" :size="24" />
              <span>{{ isDownloading ? '正在下载...' : (downloadMode === 'audio' ? '下载纯音频' : (downloadMode === 'subtitle' ? '下载字幕' : '立即下载所选资源')) }}</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div 
        v-if="isParsing"
        class="sticky bottom-0 left-0 w-full bg-surface-container-low/95 backdrop-blur-md border-t border-outline-variant/15 px-8 py-3.5 z-20 shadow-sticky-up"
      >
        <div class="max-w-xl mx-auto flex flex-col gap-2">
          <div class="flex justify-between items-center text-[12px] font-semibold">
            <div class="flex items-center gap-2 text-primary">
              <MaterialIcon name="sync" :size="16" class="animate-spin" />
              <span class="tracking-wide">正在提取视频元数据...</span>
            </div>
            <span class="font-mono text-primary font-bold">{{ parseProgress }}%</span>
          </div>
          <div class="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div 
              class="h-full bg-[#FFB347] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(255,179,71,0.4)]"
              :style="{ width: parseProgress + '%' }"
            />
          </div>
        </div>
      </div>
    </section>
    
    <!-- Right Panel - Task Queue -->
    <section class="w-[45%] bg-surface-container-low flex flex-col pt-6 px-6 pb-6 shadow-ambient z-10 border-l border-outline-variant/10">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-headline text-base font-bold text-on-surface">任务队列</h2>
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-mono font-bold text-on-secondary-container bg-secondary-container px-1.5 py-0.5 rounded-sm">
            {{ activeTaskCount }} 进行中
          </span>
          <button
            class="p-1.5 text-on-surface-variant hover:text-on-surface rounded-sm hover:bg-surface-container-highest transition-colors"
            @click="clearCompletedTasks"
            title="清除已完成任务"
          >
            <MaterialIcon name="clear_all" :size="18" />
          </button>
          <button
            class="flex items-center gap-1 px-2 py-1.5 text-[10px] font-semibold text-on-surface-variant hover:text-primary rounded-sm hover:bg-surface-container-highest transition-colors"
            :disabled="isCleaningTemp"
            @click="cleanupTempFiles"
            title="清理下载残留的临时分片文件"
          >
            <MaterialIcon v-if="isCleaningTemp" name="sync" :size="14" class="animate-spin" />
            <MaterialIcon v-else name="delete_sweep" :size="14" />
            <span>清理垃圾</span>
          </button>
        </div>
      </div>

      <!-- 过滤与失败重试工具条 -->
      <div class="flex items-center gap-2 mb-3 flex-wrap">
        <button
          class="px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-colors"
          :class="taskFilter === 'all'
            ? 'bg-primary-container text-on-primary-container border-primary/40'
            : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:border-primary/40'"
          @click="taskFilter = 'all'"
        >
          全部 {{ downloadTasks.length }}
        </button>
        <button
          class="px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-colors"
          :class="taskFilter === 'error'
            ? 'bg-error-container text-on-error-container border-error/40'
            : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:border-error/40'"
          @click="taskFilter = 'error'"
        >
          失败 {{ failedTaskCount }}
        </button>
        <template v-if="taskFilter === 'error' && failedTaskCount > 0">
          <button
            class="px-2.5 py-1 text-[11px] font-semibold rounded-full border border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant hover:border-primary/40 transition-colors"
            @click="toggleSelectAllFailed"
          >
            {{ allFailedSelected ? '取消全选' : '全选失败' }}
          </button>
          <button
            class="flex items-center gap-1 px-3 py-1 text-[11px] font-semibold rounded-full border-2 bg-tertiary-container/40 text-tertiary border-tertiary/30 hover:bg-tertiary-container/60 hover:border-tertiary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="selectedTaskIds.size === 0 || isRetrying"
            @click="retrySelectedTasks"
          >
            <MaterialIcon v-if="isRetrying" name="sync" :size="13" class="animate-spin" />
            <MaterialIcon v-else name="refresh" :size="13" />
            <span>{{ isRetrying ? '重试中...' : `重试选中 (${selectedTaskIds.size})` }}</span>
          </button>
        </template>
      </div>

      <!-- Task List -->
      <div class="flex flex-col gap-3 overflow-y-auto pr-1 pb-4">
        <div v-if="filteredTasks.length === 0" class="flex flex-col items-center justify-center py-12 text-on-surface-variant">
          <MaterialIcon name="download_for_offline" :size="48" class="mb-3 opacity-30" />
          <p class="text-sm">{{ taskFilter === 'error' ? '没有失败任务' : '暂无下载任务' }}</p>
          <p class="text-xs mt-1 opacity-70">{{ taskFilter === 'error' ? '所有任务都下载成功了 🎉' : '解析视频后点击下载按钮添加任务' }}</p>
        </div>

        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="flex flex-col p-3 rounded-md border transition-all"
          :class="{
            'bg-surface-container-lowest shadow-sm border-outline-variant/10': task.status === 'downloading' || task.status === 'merging',
            'bg-surface-container-lowest border-outline-variant/10 opacity-70': task.status === 'pending',
            'bg-surface-container-highest/60 border-outline-variant/5': task.status === 'completed',
            'bg-error-container/10 border-error/20': task.status === 'error',
            'bg-amber-container/20 border-amber/30': task.status === 'paused'
          }"
        >
          <div class="flex gap-3">
            <!-- 失败任务勾选框 -->
            <div
              v-if="task.status === 'error'"
              class="size-4 mt-1 rounded-sm border-2 flex-shrink-0 cursor-pointer transition-colors"
              :class="selectedTaskIds.has(task.id) ? 'border-primary bg-primary' : 'border-outline-variant bg-surface hover:border-primary/50'"
              @click="toggleTaskSelect(task.id)"
            />
            <!-- Thumbnail -->
            <div
              class="w-20 h-14 rounded-sm bg-surface-variant bg-cover bg-center flex-shrink-0 relative overflow-hidden"
              :style="{ backgroundImage: `url(${task.videoInfo.thumbnail})` }"
            >
              <div v-if="task.videoInfo.duration" class="absolute bottom-1 right-1 bg-inverse-surface/80 text-inverse-on-surface text-[8px] font-mono px-0.5 rounded-sm">
                {{ formatDuration(task.videoInfo.duration) }}
              </div>
              <div v-if="task.status === 'pending'" class="absolute inset-0 bg-surface/40 flex items-center justify-center backdrop-blur-[1px]">
                <MaterialIcon name="hourglass_empty" class="text-on-surface" :size="18" />
              </div>
            </div>
            
            <!-- Task Info -->
            <div class="flex flex-col flex-1 justify-between min-w-0 py-0.5">
              <div class="flex justify-between items-start gap-2">
                <h4 
                  class="font-headline text-xs font-bold truncate"
                  :class="task.status === 'pending' ? 'text-on-surface opacity-70' : 'text-on-surface'"
                >
                  {{ task.videoInfo.title }}
                </h4>
                <button 
                  class="text-on-surface-variant hover:text-error transition-colors flex-shrink-0"
                  @click="removeTask(task.id)"
                >
                  <MaterialIcon name="close" :size="14" />
                </button>
              </div>
              
              <!-- Downloading/Merging Status -->
              <template v-if="task.status === 'downloading' || task.status === 'merging'">
                <div class="flex items-center justify-between text-[10px] text-on-surface-variant font-mono">
                  <span>
                    <span v-if="task.status === 'merging'" class="text-primary">{{ task.statusMessage || '正在合并音视频...' }}</span>
                    <span v-else-if="task.speed">{{ task.speed }} - ETA {{ task.eta }}</span>
                    <span v-else>正在下载...</span>
                  </span>
                  <div class="flex items-center gap-2">
                    <button
                      class="text-on-surface-variant hover:text-amber transition-colors"
                      @click="pauseTask(task.id)"
                      title="暂停下载"
                    >
                      <MaterialIcon name="pause" :size="14" />
                    </button>
                    <span class="font-bold text-primary">{{ Math.round(task.progress || 0) }}%</span>
                  </div>
                </div>
                <div class="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden mt-1">
                  <div 
                    class="h-full bg-primary-fixed rounded-full transition-all duration-300"
                    :class="{ 'animate-pulse': task.status === 'merging' }"
                    :style="{ width: (task.progress || 0) + '%' }"
                  />
                </div>
              </template>
              
              <!-- Paused Status -->
              <template v-else-if="task.status === 'paused'">
                <div class="flex items-center justify-between text-[10px] text-on-surface-variant font-mono">
                  <span class="text-amber">已暂停</span>
                  <div class="flex items-center gap-2">
                    <button
                      class="text-on-surface-variant hover:text-primary transition-colors"
                      @click="resumeTask(task)"
                      title="继续下载"
                    >
                      <MaterialIcon name="play_arrow" :size="14" />
                    </button>
                    <span class="font-bold text-amber">{{ Math.round(task.progress || 0) }}%</span>
                  </div>
                </div>
                <div class="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden mt-1">
                  <div 
                    class="h-full bg-amber rounded-full transition-all duration-300"
                    :style="{ width: (task.progress || 0) + '%' }"
                  />
                </div>
              </template>
              
              <!-- Pending Status -->
              <div v-else-if="task.status === 'pending'" class="flex items-center gap-1.5 text-[10px] text-on-surface-variant mt-1.5">
                <MaterialIcon name="pending" :size="12" />
                <span>等待下载...</span>
              </div>
              
              <!-- Completed Status -->
              <div v-else-if="task.status === 'completed'" class="flex items-center justify-between mt-1">
                <span class="text-[10px] text-on-surface-variant font-mono">{{ task.selectedFormat.quality }}</span>
                <button 
                  class="p-1 text-on-surface-variant hover:text-primary transition-colors"
                  @click="openFileLocation(task)"
                >
                  <MaterialIcon name="folder_open" :size="16" />
                </button>
              </div>
              
              <!-- Error Status -->
              <div v-else-if="task.status === 'error'" class="flex items-center gap-1.5 text-[10px] text-error mt-1.5">
                <MaterialIcon name="error" :size="12" />
                <span class="truncate">{{ task.error || '下载失败' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Storage Info -->
      <div class="mt-auto pt-4 border-t border-outline-variant/10 flex items-center justify-between text-[11px] text-on-surface-variant">
        <div class="flex items-center gap-2">
          <MaterialIcon name="storage" :size="14" />
          <span>存储空间: {{ storageInfo }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-mono">{{ downloadDir }}</span>
          <button 
            class="p-1 hover:bg-surface-container-highest rounded transition-colors"
            @click="selectDownloadDir"
          >
            <MaterialIcon name="folder_open" :size="14" />
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MaterialIcon from './icons/MaterialIcon.vue'
import type { VideoInfo, VideoFormat, DownloadTask, AudioFormat, AudioTrack, BatchVideo } from '../types'

// URL Input
const url = ref('')

// 检测是否为 YouTube 链接
const hasParsed = ref(false)
const isYouTubeUrl = computed(() => {
  const urlStr = url.value.trim().toLowerCase()
  return urlStr.includes('youtube.com') || urlStr.includes('youtu.be')
})

// 检测是否为 B站 链接（用于显示 Cookie 提示）
const showBilibiliCookieHint = computed(() => {
  const urlStr = url.value.trim().toLowerCase()
  return urlStr.includes('bilibili.com') || urlStr.includes('b23.tv')
})

// 跳转到设置页
function goToSettings() {
  window.dispatchEvent(new CustomEvent('navigate-to-settings'))
}

// 打开 Cookie 帮助页面
function openCookieHelp() {
  window.electronAPI?.shell?.openExternal?.('https://github.com/cshuangyy/videdown/wiki/YouTube-Cookie-Setup')
}
const isParsing = ref(false)
// 解析模式：auto 自动识别 / single 强制单视频 / batch 强制主页批量
const parseMode = ref<'auto' | 'single' | 'batch'>('auto')
const parseModes: Array<{ label: string; value: 'auto' | 'single' | 'batch'; tip: string }> = [
  { label: '自动', value: 'auto', tip: '根据链接自动识别单视频或主页' },
  { label: '单视频', value: 'single', tip: '强制按单个视频解析' },
  { label: '主页批量', value: 'batch', tip: '强制按博主主页批量枚举' },
]
const parseProgress = ref(0)
const videoInfo = ref<VideoInfo | null>(null)
// 批量下载状态（抖音主页枚举）
const batchResult = ref<VideoInfo | null>(null)
const selectedBatchIds = ref<Set<string>>(new Set())
const batchAllSelected = computed(() => {
  const list = batchResult.value?.batchVideos || []
  return list.length > 0 && selectedBatchIds.value.size === list.length
})
const isBatchDownloading = ref(false)
const batchTabs = [
  { label: '作品', value: 'post' },
  { label: '喜欢', value: 'like' },
  { label: '收藏', value: 'favorite_collection' },
]
const activeBatchTab = computed(() => batchResult.value?.batchTab || 'post')
const batchSortMode = ref<'hot' | 'time'>('hot')
// 勾选前 N 个的输入（空 = 保持默认全选）
const batchSelectCount = ref('')

// 按"勾选前 N 个"输入更新选中集合：空输入恢复全选，超出总数自动截断
function applyBatchSelectCount() {
  const list = batchResult.value?.batchVideos
  if (!list || list.length === 0) return
  const raw = batchSelectCount.value.trim()
  if (!raw) {
    selectedBatchIds.value = new Set(list.map(v => v.id))
    return
  }
  let n = parseInt(raw, 10)
  if (isNaN(n) || n < 1) {
    n = 1
    batchSelectCount.value = '1'
  }
  if (n > list.length) {
    n = list.length
    batchSelectCount.value = String(n)
  }
  selectedBatchIds.value = new Set(list.slice(0, n).map(v => v.id))
}

// 批量列表排序：热度（点赞→收藏）或时间（最新在前）
function setBatchSort(mode: 'hot' | 'time') {
  batchSortMode.value = mode
  const list = batchResult.value?.batchVideos
  if (!list) return
  if (mode === 'hot') {
    list.sort((a, b) => {
      const ad = a.diggCount || 0
      const bd = b.diggCount || 0
      if (ad !== bd) return bd - ad
      return (b.collectCount || 0) - (a.collectCount || 0)
    })
  } else {
    list.sort((a, b) => (b.createTime || 0) - (a.createTime || 0))
  }
  // 排序后重新应用"勾选前 N 个"（若已输入）
  if (batchSelectCount.value.trim()) applyBatchSelectCount()
}

// 数字缩写：12051 -> 1.2万
function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + '万'
  return String(n)
}

// 切换批量列表来源：修改主页 URL 的 showTab 参数后重新解析
function switchBatchTab(tab: string) {
  if (activeBatchTab.value === tab || isParsing.value) return
  const base = batchResult.value?.webpageUrl || url.value
  if (!base || !base.includes('douyin.com/user/')) return
  try {
    const u = new URL(base)
    if (tab === 'post') {
      u.searchParams.delete('showTab')
      u.searchParams.delete('showSubTab')
    } else {
      u.searchParams.set('showTab', tab)
    }
    url.value = u.toString()
    batchResult.value = null
    selectedBatchIds.value = new Set()
    parseVideo()
  } catch (e) {
    // URL 构建失败则忽略
  }
}
const selectedFormat = ref<VideoFormat | null>(null)
const selectedAudioFormat = ref<AudioFormat | null>(null)
const selectedAudioTrack = ref<AudioTrack | null>(null)
const selectedSubtitles = ref<string[]>([])
const downloadMode = ref<'video' | 'audio' | 'subtitle'>('video')
const isDownloading = ref(false)
const urlInput = ref<HTMLTextAreaElement | null>(null)

// 选择视频格式（互斥：取消音频格式和字幕选择，保留音频轨道）
function selectVideoFormat(format: VideoFormat) {
  selectedFormat.value = format
  downloadMode.value = 'video'
  // 取消音频格式选择
  selectedAudioFormat.value = null
  // 取消字幕选择
  selectedSubtitles.value = []
}

// 选择音频格式（互斥：取消视频格式、音频轨道和字幕选择）
function selectAudioFormat(format: AudioFormat) {
  selectedAudioFormat.value = format
  downloadMode.value = 'audio'
  // 取消视频格式选择
  selectedFormat.value = null
  // 取消音频轨道
  selectedAudioTrack.value = null
  // 取消字幕选择
  selectedSubtitles.value = []
}

// 选择音频轨道（辅助选项，不取消视频格式，但取消纯音频和字幕）
function selectAudioTrack(track: AudioTrack) {
  selectedAudioTrack.value = track
  // 取消纯音频格式和字幕
  selectedAudioFormat.value = null
  selectedSubtitles.value = []
  // 如果没有选视频格式，自动选第一个
  if (!selectedFormat.value && videoInfo.value?.formats?.length) {
    selectedFormat.value = videoInfo.value.formats[0]
  }
  downloadMode.value = 'video'
}

// 选择字幕（互斥：取消视频和音频选择）
function selectSubtitle(language: string) {
  const index = selectedSubtitles.value.indexOf(language)
  if (index > -1) {
    selectedSubtitles.value.splice(index, 1)
  } else {
    selectedSubtitles.value = [language] // 只保留当前选中的字幕
  }
  // 取消视频和音频选择
  selectedFormat.value = null
  selectedAudioFormat.value = null
  selectedAudioTrack.value = null
  downloadMode.value = 'subtitle'
}

// Context Menu
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)

function showContextMenu(event: MouseEvent) {
  contextMenuX.value = event.offsetX
  contextMenuY.value = event.offsetY
  contextMenuVisible.value = true
}

function hideContextMenu() {
  contextMenuVisible.value = false
}

async function handleContextMenuAction(action: string) {
  const input = urlInput.value
  if (!input) return

  const start = input.selectionStart || 0
  const end = input.selectionEnd || 0
  const selectedText = url.value.substring(start, end)

  switch (action) {
    case 'cut':
      if (selectedText) {
        await window.electronAPI?.clipboard?.writeText?.(selectedText)
        url.value = url.value.substring(0, start) + url.value.substring(end)
        input.setSelectionRange(start, start)
      }
      break
    case 'copy':
      if (selectedText) {
        await window.electronAPI?.clipboard?.writeText?.(selectedText)
      }
      break
    case 'paste':
      try {
        const text = await window.electronAPI?.clipboard?.readText?.()
        if (text) {
          url.value = url.value.substring(0, start) + text + url.value.substring(end)
          const newPos = start + text.length
          input.setSelectionRange(newPos, newPos)
        }
      } catch (e) {
        console.error('Failed to paste:', e)
      }
      break
    case 'delete':
      if (selectedText) {
        url.value = url.value.substring(0, start) + url.value.substring(end)
        input.setSelectionRange(start, start)
      }
      break
    case 'selectAll':
      input.select()
      break
  }
  hideContextMenu()
}

// Click outside to close context menu
onMounted(() => {
  document.addEventListener('click', hideContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', hideContextMenu)
})

// Download Tasks
const downloadTasks = ref<DownloadTask[]>([])
const downloadDir = ref('')
// 任务队列过滤与失败重试
const taskFilter = ref<'all' | 'error'>('all')
const selectedTaskIds = ref<Set<string>>(new Set())
const isRetrying = ref(false)
const isCleaningTemp = ref(false)

// 队列上限：超过后自动移除最早完成的任务，防止任务积压导致界面卡顿
const MAX_TASKS = 200
function pushTask(task: DownloadTask) {
  downloadTasks.value.unshift(task)
  if (downloadTasks.value.length <= MAX_TASKS) return
  const overflow = downloadTasks.value.length - MAX_TASKS
  // 从队尾（最早添加）找已完成任务移除
  const removeIds = new Set<string>()
  for (let i = downloadTasks.value.length - 1; i >= 0 && removeIds.size < overflow; i--) {
    if (downloadTasks.value[i].status === 'completed') {
      removeIds.add(downloadTasks.value[i].id)
    }
  }
  if (removeIds.size > 0) {
    downloadTasks.value = downloadTasks.value.filter(t => !removeIds.has(t.id))
  }
}

// 清理非法文件名字符
function sanitizeFilename(filename: string): string {
  // 替换 Windows 和 Unix 中的非法字符 + 控制字符（换行/制表符等，Windows 不允许），并压缩空白
  return filename
    .replace(/[<>"/\\|?*]/g, '_')
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Platforms
const platforms = [
  { name: '抖音', icon: 'music_note' },
  { name: '小红书', icon: 'menu_book' },
  { name: 'B站', icon: 'live_tv' },
  { name: 'YouTube', icon: 'smart_display' },
  { name: 'Instagram', icon: 'photo_camera' },
]

// Computed
const activeTaskCount = computed(() => {
  return downloadTasks.value.filter(t => t.status === 'downloading' || t.status === 'pending' || t.status === 'merging' || t.status === 'paused').length
})

const failedTaskCount = computed(() => {
  return downloadTasks.value.filter(t => t.status === 'error').length
})

const filteredTasks = computed(() => {
  if (taskFilter.value === 'error') {
    return downloadTasks.value.filter(t => t.status === 'error')
  }
  return downloadTasks.value
})

const storageInfo = computed(() => {
  return '可用'
})

// Methods
function formatDuration(seconds?: number): string {
  if (!seconds) return ''
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null) return '未知'
  if (bytes === 0) return '大小未知'
  const mb = bytes / 1024 / 1024
  if (mb < 1024) {
    return `${mb.toFixed(1)} MB`
  }
  return `${(mb / 1024).toFixed(2)} GB`
}

async function pasteUrl() {
  try {
    const text = await window.electronAPI.clipboard.readText()
    url.value = text
  } catch (e) {
    console.error('Failed to read clipboard:', e)
  }
}

// 从分享文本中提取有效链接
function extractUrl(text: string): string {
  // 移除乱码字符（锟斤拷等）
  const cleanText = text.replace(/锟斤拷|锟|斤|拷/g, '').trim()
  
  // 抖音链接匹配
  const douyinMatch = cleanText.match(/https:\/\/v\.douyin\.com\/[a-zA-Z0-9_\-]+/i)
  if (douyinMatch) return douyinMatch[0]
  
  // 小红书链接匹配
  const xiaohongshuMatch = cleanText.match(/https:\/\/www\.xiaohongshu\.com\/discovery\/item\/[a-zA-Z0-9]+[^\s`]*/i)
  if (xiaohongshuMatch) return xiaohongshuMatch[0]
  
  // B站链接匹配
  const bilibiliMatch = cleanText.match(/https:\/\/www\.bilibili\.com\/video\/[a-zA-Z0-9]+[^\s`]*/i)
  if (bilibiliMatch) return bilibiliMatch[0]
  
  // B站短链接
  const b23Match = cleanText.match(/https:\/\/b23\.tv\/[a-zA-Z0-9]+/i)
  if (b23Match) return b23Match[0]
  
  // YouTube链接匹配
  const youtubeMatch = cleanText.match(/https:\/\/(www\.)?(youtube\.com\/watch\?v=[a-zA-Z0-9_-]+|youtu\.be\/[a-zA-Z0-9_-]+)/i)
  if (youtubeMatch) return 'https://' + (youtubeMatch[1] || '') + youtubeMatch[2]
  
  // Instagram链接匹配
  const instagramMatch = cleanText.match(/https:\/\/(www\.)?instagram\.com\/[^\s]+/i)
  if (instagramMatch) return instagramMatch[0]
  
  // 如果没有匹配到特定平台，尝试提取任何URL
  const generalMatch = cleanText.match(/https?:\/\/[^\s\u4e00-\u9fa5]+/i)
  if (generalMatch) return generalMatch[0]
  
  return cleanText
}

async function parseVideo() {
  if (!url.value || isParsing.value) return
  
  // 标记已点击解析按钮，隐藏 YouTube 提示
  hasParsed.value = true
  
  // 提取有效链接
  const extractedUrl = extractUrl(url.value)
  if (extractedUrl !== url.value) {
    url.value = extractedUrl
  }
  
  isParsing.value = true
  parseProgress.value = 0
  videoInfo.value = null
  selectedFormat.value = null
  
  // Simulate progress
  const progressInterval = setInterval(() => {
    if (parseProgress.value < 90) {
      parseProgress.value += Math.random() * 15
    }
  }, 200)
  
  try {
    // 获取 cookies 文件路径
    const settings = JSON.parse(localStorage.getItem('settings') || '{}')
    const cookiesFile = settings.cookiesFile || ''
    
    const info = await window.electronAPI.ytdlp.parse(url.value, cookiesFile, parseMode.value)
    videoInfo.value = info

    // 抖音主页枚举结果：进入批量下载面板
    if (info.isBatch && info.batchVideos && info.batchVideos.length > 0) {
      batchResult.value = info
      selectedBatchIds.value = new Set(info.batchVideos.map((v: BatchVideo) => v.id))
      batchSelectCount.value = ''
      videoInfo.value = null
      parseProgress.value = 100
      return
    }
    batchResult.value = null
    selectedBatchIds.value = new Set()
    
    // B站预览图需要特殊处理（添加referer）
    if (isBilibiliUrl(url.value) && info.thumbnail) {
      fetchBilibiliThumbnail(info.thumbnail)
    }
    
    // Auto select best quality
    if (info.formats && info.formats.length > 0) {
      selectedFormat.value = info.formats[0]
      downloadMode.value = 'video'
    } else if (info.audioFormats && info.audioFormats.length > 0) {
      // 如果没有视频格式但有音频格式，自动选择音频模式
      selectedAudioFormat.value = info.audioFormats[0]
      downloadMode.value = 'audio'
    }
    
    // Auto select original language audio track (default/first track)
    if (info.audioTracks && info.audioTracks.length > 0) {
      // 优先选择默认轨道或第一个轨道（通常是原语言）
      const defaultTrack = info.audioTracks.find((t: AudioTrack) => t.name?.toLowerCase().includes('default') || t.language === 'original')
      selectedAudioTrack.value = defaultTrack || info.audioTracks[0]
    } else {
      selectedAudioTrack.value = null
    }
    parseProgress.value = 100
  } catch (e: any) {
    let errorMsg = e.message || '未知错误'
    
    // 优化错误提示
    if (errorMsg.includes('not a valid URL') || errorMsg.includes('Unsupported URL') || errorMsg.includes('url')) {
      errorMsg = '请输入有效的链接'
    } else if (errorMsg.includes('not found') || errorMsg.includes('404')) {
      errorMsg = '视频不存在或已被删除'
    } else if (errorMsg.includes('private') || errorMsg.includes('登录')) {
      errorMsg = '该视频需要登录才能访问'
    } else if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
      errorMsg = '网络连接超时，请检查网络后重试'
    } else if (errorMsg.includes('ffmpeg') || errorMsg.includes('FFmpeg')) {
      errorMsg = 'FFmpeg 未找到，请确保 ffmpeg.exe 存在于程序目录'
    } else if (errorMsg.toLowerCase().includes('yt-dlp') && (errorMsg.includes('not found') || errorMsg.includes('未找到') || errorMsg.includes('cannot find') || errorMsg.includes('enoent'))) {
      errorMsg = 'yt-dlp 未找到，请确保 yt-dlp.exe 存在于程序目录'
    } else if (!errorMsg || errorMsg === '解析失败') {
      errorMsg = '无法解析该链接，请检查链接是否正确或尝试其他视频'
    }
    
    alert('解析失败：' + errorMsg)
  } finally {
    clearInterval(progressInterval)
    isParsing.value = false
  }
}

// 检查是否是B站链接
function isBilibiliUrl(url: string): boolean {
  return url.includes('bilibili.com') || url.includes('b23.tv')
}

// 获取B站预览图（需要referer）
async function fetchBilibiliThumbnail(thumbnailUrl: string) {
  try {
    const base64Image = await window.electronAPI.app.fetchImage(thumbnailUrl, 'https://www.bilibili.com/')
    if (base64Image && videoInfo.value) {
      videoInfo.value.thumbnail = base64Image
    }
  } catch (e) {
    console.error('Failed to fetch bilibili thumbnail:', e)
  }
}

async function startDownload() {
  if (!videoInfo.value || isDownloading.value) return
  if (downloadMode.value === 'video' && !selectedFormat.value) return
  if (downloadMode.value === 'audio' && !selectedAudioFormat.value) return
  if (downloadMode.value === 'subtitle' && selectedSubtitles.value.length === 0) return
  
  isDownloading.value = true
  
  const taskId = Date.now().toString()
  
  // 字幕下载模式
  if (downloadMode.value === 'subtitle') {
    const task: DownloadTask = {
      id: taskId,
      url: url.value,
      videoInfo: videoInfo.value,
      selectedFormat: {
        formatId: 'subtitle',
        quality: '字幕',
        ext: 'srt',
        filesize: 0
      },
      outputDir: downloadDir.value,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
    }
    
    // 存储额外的下载选项
    ;(task as any).downloadMode = 'subtitle'
    ;(task as any).selectedSubtitles = [...selectedSubtitles.value]
    
    pushTask(task)
    
    // Start download
    processDownload(task)
    
    isDownloading.value = false
    return
  }
  
  const task: DownloadTask = {
    id: taskId,
    url: url.value,
    videoInfo: videoInfo.value,
    selectedFormat: downloadMode.value === 'audio' && selectedAudioFormat.value
      ? { ...selectedAudioFormat.value, quality: selectedAudioFormat.value.quality, ext: selectedAudioFormat.value.ext }
      : selectedFormat.value!,
    outputDir: downloadDir.value,
    status: 'pending',
    progress: 0,
    createdAt: new Date().toISOString(),
  }
  
  // 存储额外的下载选项
  ;(task as any).downloadMode = downloadMode.value
  ;(task as any).selectedAudioTrack = selectedAudioTrack.value ? { ...selectedAudioTrack.value } : null
  ;(task as any).selectedSubtitles = []
  
  pushTask(task)
  
  // Start download
  processDownload(task)
  
  isDownloading.value = false
}

// ---------- 批量下载（抖音主页枚举） ----------

function toggleBatchItem(id: string) {
  const next = new Set(selectedBatchIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selectedBatchIds.value = next
}

function toggleBatchSelectAll() {
  const list = batchResult.value?.batchVideos || []
  if (batchAllSelected.value) {
    selectedBatchIds.value = new Set()
  } else {
    selectedBatchIds.value = new Set(list.map(v => v.id))
  }
}

function clearBatchResult() {
  batchResult.value = null
  selectedBatchIds.value = new Set()
}

async function startBatchDownload() {
  if (!batchResult.value || isBatchDownloading.value) return
  const items = (batchResult.value.batchVideos || []).filter(v => selectedBatchIds.value.has(v.id))
  if (items.length === 0) return

  isBatchDownloading.value = true
  const settings = JSON.parse(localStorage.getItem('settings') || '{}')
  const cookiesFile = settings.cookiesFile || ''

  try {
    // 逐个处理：有直链的直接入队；没有的先解析拿最优格式
    for (const item of items) {
      let selectedFormat: VideoFormat
      let title = item.title

      if (item.directUrl) {
        selectedFormat = {
          formatId: 'direct',
          quality: item.qualityLabel || '默认',
          ext: 'mp4',
          filesize: 0,
          width: 0,
          height: 0,
          hasAudio: true,
          url: item.directUrl,
        }
      } else {
        try {
          const info = await window.electronAPI.ytdlp.parse(item.url, cookiesFile, 'single')
          if (!info || !info.formats || info.formats.length === 0) continue
          title = info.title || title
          selectedFormat = info.formats[0]
        } catch (e: any) {
          // 单个视频解析失败：加入错误任务提示
          const taskId = Date.now().toString() + Math.random().toString(36).slice(2, 6)
          const task: DownloadTask = {
            id: taskId,
            url: item.url,
            videoInfo: { id: item.id, title: item.title, thumbnail: item.cover || '', webpageUrl: item.url, formats: [] },
            selectedFormat: { formatId: 'error', quality: '解析失败', ext: 'mp4' },
            outputDir: downloadDir.value,
            status: 'error',
            progress: 0,
            error: e?.message || '解析失败',
            createdAt: new Date().toISOString(),
          }
          pushTask(task)
          continue
        }
      }

      const taskId = Date.now().toString() + Math.random().toString(36).slice(2, 6)
      const task: DownloadTask = {
        id: taskId,
        url: item.url,
        videoInfo: {
          id: item.id,
          title: title,
          thumbnail: item.cover || '',
          duration: item.duration || 0,
          webpageUrl: item.url,
          formats: [selectedFormat],
        },
        selectedFormat: selectedFormat,
        outputDir: downloadDir.value,
        status: 'pending',
        progress: 0,
        createdAt: new Date().toISOString(),
      }
      pushTask(task)
      await processDownload(task)
    }
  } finally {
    isBatchDownloading.value = false
  }
}

// 存储每个任务的进度监听器清理函数
const taskProgressCleanups = new Map<string, () => void>()

async function processDownload(task: DownloadTask) {
  // 找到任务在数组中的索引，确保响应式更新
  const taskIndex = downloadTasks.value.findIndex(t => t.id === task.id)
  if (taskIndex === -1) return
  
  // 如果任务已经在下载中，不要重复启动
  if (downloadTasks.value[taskIndex].status === 'downloading' || downloadTasks.value[taskIndex].status === 'merging') {
    return
  }
  
  // 更新状态为下载中
  downloadTasks.value[taskIndex].status = 'downloading'
  
  // 如果已经有监听器，先清理
  if (taskProgressCleanups.has(task.id)) {
    taskProgressCleanups.get(task.id)!()
    taskProgressCleanups.delete(task.id)
  }
  
  // 每个任务有自己的进度监听器
  const cleanup = window.electronAPI.onDownloadProgress((data: any) => {
    if (data.taskId === task.id) {
      // 如果任务已暂停，忽略进度更新（除了完成状态）
      if (pausedTasks.has(task.id) && data.status !== 'completed') {
        return
      }
      
      // 通过索引更新，确保响应式
      const idx = downloadTasks.value.findIndex(t => t.id === task.id)
      if (idx !== -1) {
        if (data.status === 'merging') {
          downloadTasks.value[idx].status = 'merging'
          downloadTasks.value[idx].statusMessage = data.message || '正在合并音视频...'
          downloadTasks.value[idx].progress = 99
        } else if (data.status === 'completed') {
          downloadTasks.value[idx].status = 'completed'
          downloadTasks.value[idx].progress = 100
          pausedTasks.delete(task.id)
        } else {
          downloadTasks.value[idx].progress = data.percent || 0
          downloadTasks.value[idx].totalSize = data.totalSize
          downloadTasks.value[idx].speed = data.speed
          downloadTasks.value[idx].eta = data.eta
        }
      }
    }
  })
  
  // 存储清理函数
  taskProgressCleanups.set(task.id, cleanup)
  
  try {
    // 检查是否有直接下载链接（抖音/快手等通过 Puppeteer 解析的平台）
    const directUrl = task.selectedFormat.url
    const isDouyin = task.url.includes('douyin.com') || task.url.includes('v.douyin.com')
    const isKuaishou = task.url.includes('kuaishou.com') || task.url.includes('v.kuaishou.com')
    const useDirectDownload = isDouyin || isKuaishou
    
    // 获取 cookies 文件路径和文件名模板
    const settings = JSON.parse(localStorage.getItem('settings') || '{}')
    const cookiesFile = settings.cookiesFile || ''
    const filenameTemplate = settings.filenameTemplate || '%(title)s'

    const downloadOptions: any = {
      url: task.url,
      formatId: task.selectedFormat.formatId,
      outputDir: task.outputDir,
      taskId: task.id,
      directUrl: useDirectDownload && directUrl ? directUrl : undefined,
      audioUrl: useDirectDownload && directUrl ? task.selectedFormat.audioUrl : undefined,
      filename: useDirectDownload && directUrl ? `${sanitizeFilename(task.videoInfo.title).slice(0, 50)}_${task.selectedFormat.quality}.mp4` : undefined,
      cookiesFile: cookiesFile,
      filenameTemplate: filenameTemplate,
    }
    
    // 添加 YouTube 特有选项
    if ((task as any).downloadMode === 'audio') {
      downloadOptions.downloadMode = 'audio'
    }
    if ((task as any).downloadMode === 'subtitle') {
      downloadOptions.downloadMode = 'subtitle'
    }
    if ((task as any).selectedAudioTrack) {
      downloadOptions.audioTrack = { ...(task as any).selectedAudioTrack }
    }
    if ((task as any).selectedSubtitles?.length > 0) {
      downloadOptions.subtitles = (task as any).selectedSubtitles
    }
    
    const result = await window.electronAPI.ytdlp.download(downloadOptions)

    // 更新任务状态到数组（确保响应式）
    const finalIdx = downloadTasks.value.findIndex(t => t.id === task.id)
    if (finalIdx !== -1) {
      downloadTasks.value[finalIdx].status = 'completed'
      downloadTasks.value[finalIdx].filePath = (result as any).filePath
      downloadTasks.value[finalIdx].progress = 100
    }

    // Add to history
    await window.electronAPI.history.add({
      title: task.videoInfo.title,
      thumbnail: task.videoInfo.thumbnail,
      url: task.url,
      filePath: (result as any).filePath,
      format: task.selectedFormat.ext,
      quality: task.selectedFormat.quality,
    })
  } catch (e: any) {
    // 优化错误提示
    let errorMsg = e.message || '下载失败'
    
    if (errorMsg.includes('disk') || errorMsg.includes('space')) {
      errorMsg = '磁盘空间不足，请清理磁盘后重试'
    } else if (errorMsg.includes('permission') || errorMsg.includes('access')) {
      errorMsg = '没有写入权限，请更换下载目录或以管理员身份运行'
    } else if (errorMsg.includes('network') || errorMsg.includes('timeout') || errorMsg.includes('ECONNRESET')) {
      errorMsg = '网络连接中断，请检查网络后重试'
    } else if (errorMsg.includes('ffmpeg') || errorMsg.includes('FFmpeg')) {
      errorMsg = 'FFmpeg 合并失败，请确保 ffmpeg.exe 存在于程序目录'
    } else if (errorMsg.includes('cancel') || errorMsg.includes('abort')) {
      errorMsg = '下载已取消'
    } else if (errorMsg.includes('[Douyin]') || errorMsg.includes('Douyin')) {
      errorMsg = '抖音下载失败（网络波动或风控拦截），请稍后重试'
    }

    // 更新错误状态到数组（确保响应式）
    const errorIdx = downloadTasks.value.findIndex(t => t.id === task.id)
    if (errorIdx !== -1) {
      downloadTasks.value[errorIdx].status = 'error'
      downloadTasks.value[errorIdx].error = errorMsg
    }
  } finally {
    // 清理监听器
    if (taskProgressCleanups.has(task.id)) {
      taskProgressCleanups.get(task.id)!()
      taskProgressCleanups.delete(task.id)
    }
  }
}

// 存储每个任务的暂停状态
const pausedTasks = new Set<string>()

function pauseTask(taskId: string) {
  const taskIndex = downloadTasks.value.findIndex(t => t.id === taskId)
  if (taskIndex !== -1) {
    downloadTasks.value[taskIndex].status = 'paused'
    downloadTasks.value[taskIndex].speed = undefined
    downloadTasks.value[taskIndex].eta = undefined
    pausedTasks.add(taskId)
    // 通知主进程暂停下载
    window.electronAPI?.ytdlp?.pauseDownload?.(taskId)
  }
}

function resumeTask(task: DownloadTask) {
  const taskIndex = downloadTasks.value.findIndex(t => t.id === task.id)
  if (taskIndex !== -1) {
    downloadTasks.value[taskIndex].status = 'downloading'
    // 从暂停集合中移除
    pausedTasks.delete(task.id)
    // 重新启动下载
    processDownload(downloadTasks.value[taskIndex])
  }
}

function removeTask(taskId: string) {
  downloadTasks.value = downloadTasks.value.filter(t => t.id !== taskId)
  const next = new Set(selectedTaskIds.value)
  next.delete(taskId)
  selectedTaskIds.value = next
}

function clearCompletedTasks() {
  downloadTasks.value = downloadTasks.value.filter(t => t.status !== 'completed')
}

// 清理下载残留的垃圾文件（临时分片、合并残留）
async function cleanupTempFiles() {
  if (isCleaningTemp.value) return
  isCleaningTemp.value = true
  try {
    const result = await window.electronAPI.cleanupTempFiles(downloadDir.value)
    const mb = ((result?.freedBytes || 0) / 1024 / 1024).toFixed(1)
    if (result?.removed > 0) {
      alert(`已清理 ${result.removed} 个垃圾文件，释放 ${mb} MB`)
    } else {
      alert('没有发现垃圾文件，目录很干净 ✨')
    }
  } catch (e: any) {
    alert('清理失败：' + (e?.message || '未知错误'))
  } finally {
    isCleaningTemp.value = false
  }
}

// ---------- 失败任务勾选与重试 ----------

const allFailedSelected = computed(() => {
  const failed = downloadTasks.value.filter(t => t.status === 'error')
  return failed.length > 0 && failed.every(t => selectedTaskIds.value.has(t.id))
})

function toggleTaskSelect(taskId: string) {
  const next = new Set(selectedTaskIds.value)
  if (next.has(taskId)) {
    next.delete(taskId)
  } else {
    next.add(taskId)
  }
  selectedTaskIds.value = next
}

function toggleSelectAllFailed() {
  const failed = downloadTasks.value.filter(t => t.status === 'error')
  if (allFailedSelected.value) {
    selectedTaskIds.value = new Set()
  } else {
    selectedTaskIds.value = new Set(failed.map(t => t.id))
  }
}

// 重试选中的失败任务：逐个重新下载（解析失败的任务会先重新解析）
async function retrySelectedTasks() {
  const targets = downloadTasks.value.filter(t => t.status === 'error' && selectedTaskIds.value.has(t.id))
  if (targets.length === 0 || isRetrying.value) return

  isRetrying.value = true
  const settings = JSON.parse(localStorage.getItem('settings') || '{}')
  const cookiesFile = settings.cookiesFile || ''

  try {
    for (const t of targets) {
      const idx = downloadTasks.value.findIndex(x => x.id === t.id)
      if (idx === -1) continue

      // 解析失败的任务（批量里无直链的条目）：先重新解析拿格式
      if (t.selectedFormat.formatId === 'error') {
        downloadTasks.value[idx].status = 'pending'
        downloadTasks.value[idx].error = undefined
        downloadTasks.value[idx].progress = 0
        try {
          const info = await window.electronAPI.ytdlp.parse(t.url, cookiesFile, 'single')
          if (!info || !info.formats || info.formats.length === 0) {
            downloadTasks.value[idx].status = 'error'
            downloadTasks.value[idx].error = '重新解析失败'
            continue
          }
          downloadTasks.value[idx].videoInfo = { ...downloadTasks.value[idx].videoInfo, title: info.title || t.videoInfo.title, formats: info.formats }
          downloadTasks.value[idx].selectedFormat = info.formats[0]
        } catch (e: any) {
          downloadTasks.value[idx].status = 'error'
          downloadTasks.value[idx].error = e?.message || '重新解析失败'
          continue
        }
      }

      // 重置状态后重新下载
      const i2 = downloadTasks.value.findIndex(x => x.id === t.id)
      downloadTasks.value[i2].status = 'pending'
      downloadTasks.value[i2].error = undefined
      downloadTasks.value[i2].progress = 0
      downloadTasks.value[i2].speed = undefined
      downloadTasks.value[i2].eta = undefined
      await processDownload(downloadTasks.value[i2])
    }
  } finally {
    isRetrying.value = false
    selectedTaskIds.value = new Set()
  }
}

async function openFileLocation(task: DownloadTask) {
  if (task.filePath) {
    await window.electronAPI.shell.openPath(task.filePath)
  }
}

async function selectDownloadDir() {
  const dir = await window.electronAPI.dialog.selectFolder()
  if (dir) {
    downloadDir.value = dir
    // 同步保存到 settings
    const savedSettings = localStorage.getItem('settings')
    const settings = savedSettings ? JSON.parse(savedSettings) : {}
    settings.downloadDir = dir
    localStorage.setItem('settings', JSON.stringify(settings))
  }
}

// 加载下载目录
async function loadDownloadDir() {
  const savedSettings = localStorage.getItem('settings')
  if (savedSettings) {
    const settings = JSON.parse(savedSettings)
    if (settings.downloadDir) {
      downloadDir.value = settings.downloadDir
    } else {
      downloadDir.value = await window.electronAPI.app.getDefaultDownloadDir()
    }
  } else {
    downloadDir.value = await window.electronAPI.app.getDefaultDownloadDir()
  }
}

// Initialize
onMounted(async () => {
  await loadDownloadDir()
  
  // 监听标签切换事件，切换回下载页时重新加载设置
  window.addEventListener('tab-changed', async (e: any) => {
    if (e.detail === 'download') {
      await loadDownloadDir()
    }
  })
})
</script>
