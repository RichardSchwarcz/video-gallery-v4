import useEmblaCarousel from 'embla-carousel-react'

function EmblaCarousel({ children }: { children: React.ReactNode }) {
  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
  })

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex gap-4">{children}</div>
    </div>
  )
}

export default EmblaCarousel
