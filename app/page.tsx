const REPO = 'Yossy-Nissy/bizagent-releases';
const PRIMARY_ASSET = 'BizAgent-darwin-arm64.dmg';
const LATEST_DOWNLOAD_URL = `https://github.com/${REPO}/releases/latest/download/${PRIMARY_ASSET}`;

type Asset = {
	name: string;
	browser_download_url: string;
	size: number;
};

type Release = {
	tag_name: string;
	name: string;
	published_at: string;
	html_url: string;
	assets: Asset[];
	prerelease: boolean;
	draft: boolean;
};

async function fetchReleases(): Promise<Release[]> {
	try {
		const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=20`, {
			headers: { Accept: 'application/vnd.github+json' },
			next: { revalidate: 3600 },
		});
		if (!res.ok) return [];
		const data = (await res.json()) as Release[];
		return data.filter((r) => !r.draft);
	} catch {
		return [];
	}
}

async function fetchLatestRelease(): Promise<Release | null> {
	try {
		const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
			headers: { Accept: 'application/vnd.github+json' },
			next: { revalidate: 3600 },
		});
		if (!res.ok) return null;
		return (await res.json()) as Release;
	} catch {
		return null;
	}
}

function compareSemverDesc(a: string, b: string): number {
	const pa = a.replace(/^v/, '').split('.').map(Number);
	const pb = b.replace(/^v/, '').split('.').map(Number);
	for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
		const da = pa[i] ?? 0;
		const db = pb[i] ?? 0;
		if (da !== db) return db - da;
	}
	return 0;
}

function formatDate(iso: string): string {
	const d = new Date(iso);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatSize(bytes: number): string {
	const mb = bytes / 1024 / 1024;
	return `${mb.toFixed(0)} MB`;
}

function pickDmg(assets: Asset[]): Asset | undefined {
	return assets.find((a) => a.name.endsWith('.dmg'));
}

const AHA_SCENES = [
	{
		num: '01',
		title: '会議が終わったら、議事録もタスクも、できている。',
		body: '録音から文字起こしまで自動。会議が終わった瞬間、要点・決定事項・ToDoがそのままタスクボードに並びます。',
		image: '/screenshots/scene1.png',
		alt: 'オンライン会議が終了し、AIが議事録を文字起こしている画面',
	},
	{
		num: '02',
		title: 'AIが、並列で、全部やる。',
		body: 'タスクボード上で複数のClaude Codeが同時に走り、見積書・スライド・提案資料を並列に進めます。あなたは結果を見届けるだけ。',
		image: '/screenshots/scene3.png',
		alt: 'BizAgentのカンバンボード上でAIが複数タスクを並列実行している画面',
	},
	{
		num: '03',
		title: 'もう、終わってる。',
		body: '気づけばカンバンの完了列に、成果物がそろっている。1日4タスク・2時間削減・効率+340%の実例も。',
		image: '/screenshots/scene4.png',
		alt: 'タスクが完了しKPIダッシュボードに数値が表示される画面',
	},
];

const COMPARISON_ROWS: Array<{
	label: string;
	values: [string, string, string, string, string];
	highlight?: boolean;
}> = [
	{
		label: '主要ターゲット',
		values: ['ビジネスパーソン', '開発者', 'エンジニア', 'ビジネスパーソン', 'エンタープライズ'],
	},
	{
		label: 'Claude Code起動',
		values: ['ワンクリック', 'CLI設定要', '別途設定', 'なし', 'なし'],
		highlight: true,
	},
	{
		label: 'タスクカンバン',
		values: ['標準搭載', 'なし', 'なし', '限定的', '別アプリ'],
		highlight: true,
	},
	{
		label: 'ファイル/PJ文脈管理',
		values: ['標準搭載', 'なし', 'プロジェクト単位', 'なし', 'Drive'],
	},
	{
		label: 'ローカル実行',
		values: ['◯', '◯', '◯', '✕（クラウド）', '✕（クラウド）'],
	},
	{
		label: 'VS Code拡張互換',
		values: ['◯', '✕', '◯', '✕', '✕'],
	},
	{
		label: '月額料金',
		values: ['無料', '$20〜200', '$20〜200', '$25〜250', '$14〜22'],
		highlight: true,
	},
];

const COMPARISON_COLS = [
	'BizAgent',
	'Claude Code単体',
	'Cursor / Windsurf',
	'Genspark',
	'GWS + Gemini',
];

export default async function Home() {
	const [releases, latestFromApi] = await Promise.all([fetchReleases(), fetchLatestRelease()]);
	const sortedHistory = [...releases].sort((a, b) => compareSemverDesc(a.tag_name, b.tag_name));
	const latest = latestFromApi ?? sortedHistory[0] ?? null;
	const history = sortedHistory;

	return (
		<main>
			<section className="hero">
				<div className="brand">
					<span className="brand-dot" aria-hidden />
					BizAgent
				</div>
				<h1>AIに丸投げしたら、仕事が終わる。</h1>
				<p className="lead">
					ターミナルもコードも要らない。議事録・タスク・資料作成を、ビジネスパーソンのまま Claude Code に任せられる macOS 向け AI エディタです。
				</p>
				<div className="cta-row">
					<a className="btn-primary" href={LATEST_DOWNLOAD_URL}>
						<DownloadIcon />
						macOS版をダウンロード
					</a>
					<p className="cta-meta">
						対応: <strong>macOS Apple Silicon (arm64)</strong>
						{latest ? (
							<>
								{' '}・ 最新バージョン: <strong>{latest.tag_name}</strong>
								{' '}（{formatDate(latest.published_at)}）
							</>
						) : null}
					</p>
				</div>
			</section>

			<section className="promo">
				<div className="container">
					<div className="promo-frame">
						<video
							className="promo-video"
							src="/bizagent-promo.mp4"
							autoPlay
							muted
							loop
							playsInline
							preload="metadata"
							poster="/screenshots/scene4.png"
						/>
					</div>
					<p className="promo-caption">会議が終わったら、もう終わってる。 — 15秒で見るBizAgent</p>
				</div>
			</section>

			<section className="aha">
				<div className="container">
					<h2>AIに丸投げするって、こういうこと。</h2>
					<p className="section-lead">
						BizAgentの中で起きる「3つのアハ体験」。会議の後にあなたが何もしなくても、ビジネスタスクが進みはじめます。
					</p>
					<div className="aha-grid">
						{AHA_SCENES.map((s) => (
							<article key={s.num} className="aha-item">
								<div className="aha-image">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img src={s.image} alt={s.alt} loading="lazy" />
								</div>
								<div className="aha-text">
									<span className="aha-num">{s.num}</span>
									<h3>{s.title}</h3>
									<p>{s.body}</p>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className="features">
				<div className="container">
					<h2>ビジネスパーソンのためのAIエディタ</h2>
					<p className="section-lead">
						エンジニア向けのCursorやCopilotとは違い、BizAgentはビジネスの仕事を AI と一緒に進めるために設計されています。
					</p>
					<div className="feature-grid">
						<Feature
							title="Claude Code をワンクリックで"
							description="ターミナル設定やコマンド入力なしで Claude Code を起動。話しかけるだけで議事録要約・資料作成・タスク整理が進みます。"
							icon={<IconBolt />}
							image="/screenshots/scene1.png"
							imageAlt="Claude Codeがワンクリックで起動する画面"
						/>
						<Feature
							title="ビジネスタスクに最適化"
							description="タスクカンバン・ファイルボックス・スキル管理を標準搭載。プロジェクト・人物・ドキュメントを一元管理し、AIに渡せる文脈として整います。"
							icon={<IconLayout />}
							image="/screenshots/scene3.png"
							imageAlt="タスクカンバンとファイルボックスのUI"
						/>
						<Feature
							title="VS Code 互換で迷わない"
							description="VS Code (Code-OSS) をベースに、初心者向けにUIを簡略化。拡張機能はそのまま使えて、必要になれば「開発者モード」でフルUIに切替可能。"
							icon={<IconText />}
							image="/screenshots/scene2.png"
							imageAlt="VS Code互換のシンプルモードUI"
						/>
					</div>
				</div>
			</section>

			<section className="comparison">
				<div className="container">
					<h2>他のAIエディタ・AIエージェントと、何が違うか。</h2>
					<p className="section-lead">
						「ビジネスパーソンが、ローカルで、Claude Codeをワンクリックで使える」 — この3つを満たすのは、いまのところBizAgentだけです。
					</p>
					<div className="comparison-table-wrap">
						<table className="comparison-table">
							<thead>
								<tr>
									<th scope="col" className="comp-th-leading">観点</th>
									{COMPARISON_COLS.map((col, i) => (
										<th
											key={col}
											scope="col"
											className={i === 0 ? 'comp-th-self' : ''}
										>
											{col}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{COMPARISON_ROWS.map((row) => (
									<tr key={row.label}>
										<th scope="row">{row.label}</th>
										{row.values.map((v, i) => (
											<td
												key={i}
												className={`${i === 0 ? 'comp-td-self' : ''} ${row.highlight && i === 0 ? 'comp-highlight' : ''}`}
											>
												{v}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<p className="comparison-foot">
						※ 価格は2026年5月時点の各社公開情報に基づく月額目安。BizAgentは本体無料で、Claude API（または Claude Pro $20/月）が別途必要です。
					</p>
				</div>
			</section>

			{history.length > 0 ? (
				<section className="history">
					<div className="container">
						<h2>リリース履歴</h2>
						<p className="history-lead">過去のバージョンもダウンロードできます。</p>
						<ul className="release-list">
							{history.map((r) => {
								const dmg = pickDmg(r.assets);
								return (
									<li key={r.tag_name} className="release-item">
										<div className="release-meta">
											<span className="release-tag">{r.tag_name}</span>
											<span className="release-date">{formatDate(r.published_at)}</span>
											{dmg ? <span className="release-size">{formatSize(dmg.size)}</span> : null}
										</div>
										<div className="release-actions">
											{dmg ? (
												<a className="btn-secondary" href={dmg.browser_download_url}>
													<DownloadIcon />
													DMG
												</a>
											) : (
												<span className="release-empty">アセットなし</span>
											)}
											<a className="release-link" href={r.html_url} rel="noreferrer noopener">
												詳細 ↗
											</a>
										</div>
									</li>
								);
							})}
						</ul>
					</div>
				</section>
			) : null}

			<section className="community">
				<div className="container">
					<h2>BizAgent Learning コミュニティ</h2>
					<p>
						BizAgent と Claude Code を使いこなす学びの場。
						もくもく会・教材・Discord で、初心者からバイブコーダーへの歩みを後押しします。
					</p>
				</div>
			</section>

			<footer className="footer">
				<div className="container">
					<span>© {new Date().getFullYear()} BizAgent — Built by Almie</span>
					<span>
						<a href={`https://github.com/${REPO}`} rel="noreferrer noopener">
							GitHub
						</a>
						{' ・ '}
						<a href={`https://github.com/${REPO}/releases`} rel="noreferrer noopener">
							全リリース
						</a>
					</span>
				</div>
			</footer>
		</main>
	);
}

function Feature({
	title,
	description,
	icon,
	image,
	imageAlt,
}: {
	title: string;
	description: string;
	icon: React.ReactNode;
	image?: string;
	imageAlt?: string;
}) {
	return (
		<div className="feature">
			{image ? (
				<div className="feature-image">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={image} alt={imageAlt ?? ''} loading="lazy" />
				</div>
			) : null}
			<div className="feature-icon" aria-hidden>
				{icon}
			</div>
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
	);
}

function IconLayout() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
			<rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
			<path d="M3 9h18M9 9v12" stroke="currentColor" strokeWidth="2" />
		</svg>
	);
}

function IconText() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
			<path
				d="M5 4h14M5 12h14M5 20h10"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function IconBolt() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
			<path
				d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function DownloadIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
			<path
				d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
				stroke="currentColor"
				strokeWidth="2.2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
