import { CSSProperties, useCallback, useEffect, useRef } from 'react'

interface InfiniteScrollProps {
  load: () => void;
  hasMore: boolean;
  loader: React.ReactNode;
  children?: React.ReactNode;
  endMessage?: React.ReactNode;
  style?: CSSProperties
}
  
export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  load,
  hasMore,
  loader,
  children,
  endMessage,
  style
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  
  const handleIntersect = useCallback(
    (
      entries: IntersectionObserverEntry[],
      observer: IntersectionObserver
    ) => {
      // Check if the sentinel element is intersecting, and if so, call the load function
      if (entries[0].isIntersecting && hasMore) {
        load()
      }
    },
    [load, hasMore]
  )
  
  useEffect(() => {
    // Create a new IntersectionObserver when the component mounts
    observerRef.current = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '150px',
      threshold: 1,
    })
  
    // Attach the observer to the sentinel element
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current)
    }
  
    // Clean up the observer when the component unmounts
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [load, handleIntersect])
  
  useEffect(() => {
    // When the hasMore prop changes, disconnect the previous observer and reattach it to the new sentinel element
    if (observerRef.current && sentinelRef.current) {
      observerRef.current.disconnect()
      observerRef.current.observe(sentinelRef.current)
    }
  }, [hasMore])
  
  return (
    <div style={ style }>
      { children }
      <div ref={ sentinelRef }>{ hasMore && loader }</div>
      { !hasMore && endMessage }
    </div>
  )
}