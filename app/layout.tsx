import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
	title: 'BizAgent - 会話しているだけで、仕事が終わる。',
	description:
		'BizAgentは、Claude Codeを最大活用するための、ビジネスパーソン向けAIエディタ。VS Codeをベースに、タスクカンバン・ファイルボックス・スキル管理を統合。',
	openGraph: {
		title: 'BizAgent',
		description: '会話しているだけで、仕事が終わる。Claude Code を最大活用するためのAIエディタ。',
		type: 'website',
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ja">
			<body>{children}</body>
		</html>
	);
}
