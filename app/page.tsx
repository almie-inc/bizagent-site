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
				<h1>会話しているだけで、仕事が終わる。</h1>
				<p className="lead">
					BizAgentは、Claude Code を最大活用するためのビジネスパーソン向けAIエディタ。
					議事録もタスクも資料作成も、AIとの会話だけで進みます。
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
						/>
						<Feature
							title="ビジネスタスクに最適化"
							description="タスクカンバン・ファイルボックス・スキル管理を標準搭載。プロジェクト・人物・ドキュメントを一元管理し、AIに渡せる文脈として整います。"
							icon={<IconLayout />}
						/>
						<Feature
							title="VS Code 互換で迷わない"
							description="VS Code (Code-OSS) をベースに、初心者向けにUIを簡略化。拡張機能はそのまま使えて、必要になれば「開発者モード」でフルUIに切替可能。"
							icon={<IconText />}
						/>
					</div>
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
}: {
	title: string;
	description: string;
	icon: React.ReactNode;
}) {
	return (
		<div className="feature">
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
