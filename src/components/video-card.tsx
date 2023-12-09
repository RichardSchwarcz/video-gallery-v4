import Image from 'next/image'
import { truncateTitle } from '~/utils/truncateVideoTitle'
import { TooltipWrapper } from './tooltip-wrapper'
import type { VideoSchema } from '~/server/api/types/videoTypes'

function VideoCard({ data }: { data: VideoSchema }) {
  return (
    <div className="my-2 flex h-[152px] w-[141px] flex-col rounded-md border border-slate-500">
      <Image
        src={data.thumbnail}
        alt="img"
        width="141"
        height="80"
        className="rounded-t-md"
        quality={100}
      />
      <TooltipWrapper text={data.title}>
        <a href={data.url} target="_blank">
          <div className="p-2 text-sm">{truncateTitle(data.title)}</div>
        </a>
      </TooltipWrapper>
      <TooltipWrapper text={data.videoOwnerChannelTitle}>
        <div className="p-2 text-sm font-semibold">
          {data.videoOwnerChannelTitle}
        </div>
      </TooltipWrapper>
    </div>
  )
}

export default VideoCard
