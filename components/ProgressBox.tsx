"use client";

export default function ProgressBox({ stage }: { stage: string }) {
  return (
    <div className="border rounded-md p-3 text-sm bg-gray-50">
      <div className="font-medium">진행 상황</div>
      <div className="mt-1 text-gray-700">{stage}</div>
      <div className="mt-2 text-gray-500">
        보통 30~60초 내 완료됩니다.
      </div>
    </div>
  );
}
