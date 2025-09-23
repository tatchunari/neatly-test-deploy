import { Skeleton, SVGSkeleton } from "./Skeleton";

export const RoomListSkeleton = () => (
  <>
    <div className="flex-1">
      <div className="flex flex-row justify-between border-b border-gray-400 pb-5 mt-10 mx-10">
        <div>
          <Skeleton className="w-[120px] max-w-full" />
        </div>
        <div className="flex flex-row gap-3">
          <div className="flex items-center pl-3 gap-2 border-gray-500/30 h-[46px] max-w-md w-full">
            <div className="w-full h-full">
              <Skeleton className="w-[120px] max-w-full" />
            </div>
          </div>
          <div className="w-64">
            <Skeleton className="w-[232px] max-w-full" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mt-10 mx-auto p-6 min-h-screen min-w-3">
        <div className="shadow-sm">
          <div className="grid grid-cols-7 gap-5 p-4">
            <div>
              <Skeleton className="w-[40px] max-w-full" />
            </div>
            <div>
              <Skeleton className="w-[72px] max-w-full" />
            </div>
            <div>
              <Skeleton className="w-[40px] max-w-full" />
            </div>
            <div>
              <Skeleton className="w-[120px] max-w-full" />
            </div>
            <div>
              <Skeleton className="w-[64px] max-w-full" />
            </div>
            <div>
              <Skeleton className="w-[64px] max-w-full" />
            </div>
            <div>
              <Skeleton className="w-[72px] max-w-full" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-4 p-4 border-b border-gray-100 transition-colors items-center">
            <div className="w-28 h-16">
              <SVGSkeleton className="object-cover w-full h-full" />
            </div>
            <div>
              <Skeleton className="w-[88px] max-w-full" />
            </div>
            <div>
              <Skeleton className="w-[56px] max-w-full" />
            </div>
            <div>
              <Skeleton className="w-[56px] max-w-full" />
            </div>
            <div>
              <Skeleton className="w-[14px] max-w-full" />
            </div>
            <div>
              <Skeleton className="w-[72px] max-w-full" />
            </div>
            <div>
              <Skeleton className="w-[48px] max-w-full" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-4 p-4 border-b border-gray-100 transition-colors items-center">
            <div className="w-28 h-16">
              <SVGSkeleton className="object-cover w-full h-full" />
            </div>
            <div>
              <Skeleton className="w-[104px] max-w-full" />
            </div>
            <div>
              <Skeleton className="w-[56px] max-w-full" />
            </div>
            <div>
              <Skeleton className="w-[56px] max-w-full" />
            </div>
            <div>
              <Skeleton className="w-[14px] max-w-full" />
            </div>
            <div>
              <Skeleton className="w-[80px] max-w-full" />
            </div>
            <div>
              <Skeleton className="w-[48px] max-w-full" />
            </div>
          </div>
          <div className="p-8">
            <Skeleton className="w-[248px] max-w-full" />
          </div>
          <div className="flex items-center justify-center p-6 border-t border-gray-400">
            <div className="flex items-center space-x-2">
              <div className="p-2">
                <SVGSkeleton className="w-2 h-4" />
              </div>
              <div className="px-3 py-1">
                <Skeleton className="w-[14px] max-w-full" />
              </div>
              <div className="px-3 py-1">
                <Skeleton className="w-[14px] max-w-full" />
              </div>
              <div className="px-3 py-1">
                <Skeleton className="w-[14px] max-w-full" />
              </div>
              <span>
                <Skeleton className="w-[24px] max-w-full" />
              </span>
              <div className="p-2">
                <SVGSkeleton className="w-2 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

