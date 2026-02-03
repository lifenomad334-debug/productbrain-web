import GenerateForm from "@/components/GenerateForm";

export default function Page() {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">ProductBrain 생성</h1>
      <p className="text-sm text-gray-600 mt-2">
        제품명 + 플랫폼 + 추가정보만 넣으면 상세페이지 이미지를 자동 생성합니다.
      </p>
      <div className="mt-6">
        <GenerateForm />
      </div>
    </main>
  );
}
