import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export default function TermsPage() {
  return (
    <main id="main-content" className="min-h-screen bg-ink-50 px-4 py-8 md:py-14">
      <article className="mx-auto max-w-3xl rounded-2xl border border-border bg-white p-6 shadow-sm md:p-10">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-ink-300 hover:text-vermilion"><ArrowLeft className="h-3.5 w-3.5" />返回首页</Link>
        <div className="mt-6 flex gap-3"><Scale className="h-8 w-8 text-vermilion" /><div><h1 className="text-2xl font-bold text-ink-500">使用规则</h1><p className="mt-1 text-sm text-ink-400">版本 2026-09-05</p></div></div>
        <div className="mt-8 space-y-5 text-sm leading-7 text-ink-400"><p>本服务提供历史人物启发式对话和学习体验。AI 可能出错、产生虚构内容或带有时代局限；请不要将回答作为事实、专业建议或紧急服务的替代品。</p><p>不得使用服务生成或传播违法内容、对未成年人的性内容、具体暴力威胁、骚扰、欺诈、侵权内容，或绕过安全控制。出现此类内容时，系统可能拒绝处理并仅保留不含正文的类别级安全事件。</p><p>请仅上传或输入你有权处理的信息。若你认为内容治理有误，或需要隐私支持，请通过项目公开的支持渠道联系运营者。</p><p>服务的可用性、免费额度和第三方提供商限制可能变化。发生安全、维护或合规需要时，我们可以限制功能并提前尽力说明。</p></div>
      </article>
    </main>
  );
}
