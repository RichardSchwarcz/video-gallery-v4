import Image from 'next/image'
import { truncateTitle } from '~/utils/truncateVideoTitle'
import { TooltipWrapper } from './tooltip-wrapper'
import type { VideoSchema } from '~/server/api/types/videoTypes'

function VideoCard({ data }: { data: VideoSchema }) {
  return (
    <div className="relative my-2 flex h-[152px] w-[141px] flex-col rounded-md outline outline-1 outline-slate-500">
      <div className="relative h-[78px] w-[141px] overflow-hidden rounded-t-md">
        <Image
          src={data.thumbnail}
          alt="img"
          width="141"
          height="80"
          className="absolute top-[-15px]"
          quality={100}
        />
      </div>
      <div className="absolute top-[80px] p-2">
        <TooltipWrapper text={data.title}>
          <a href={data.url} target="_blank">
            <div className="text-sm">{truncateTitle(data.title, 30)}</div>
          </a>
        </TooltipWrapper>
        <TooltipWrapper text={data.videoOwnerChannelTitle}>
          <div className="text-sm font-semibold">
            {data.videoOwnerChannelTitle}
          </div>
        </TooltipWrapper>
      </div>
    </div>
  )
}

export default VideoCard
