<script setup lang="ts">
definePageMeta( {
	layout: 'landing'
} )

onMounted( () => {
	runTerminalAnimation()
	scheduleBabyglobe()
} )

function scheduleBabyglobe(): void {
	if ( window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
		return
	}
	const globe = document.getElementById( 'landing-babyglobe' )
	if ( !globe ) {
		return
	}
	const gifs = [
		'/babyglobe/Book_Baby_Globe.gif',
		'/babyglobe/Headphones_Baby_Globe.gif',
		'/babyglobe/Laptop_Baby_Globe.gif',
		'/babyglobe/Phone_Baby_Globe.gif'
	]
	const narrowQuery = window.matchMedia( '(max-width: 900px)' )

	function popOnce(): void {
		const positions = narrowQuery.matches ? [ 't', 'b' ] : [ 'br', 'tr', 'r' ]
		const gif = gifs[ Math.floor( Math.random() * gifs.length ) ]
		const pos = positions[ Math.floor( Math.random() * positions.length ) ]
		globe!.setAttribute( 'src', gif! )
		globe!.setAttribute( 'data-pos', pos! )
		requestAnimationFrame( () => {
			requestAnimationFrame( () => {
				globe!.classList.add( 'is-visible' )
			} )
		} )
		const stayMs = 2500 + Math.random() * 1500
		setTimeout( () => {
			globe!.classList.remove( 'is-visible' )
			const nextMs = 7000 + Math.random() * 9000
			setTimeout( popOnce, nextMs )
		}, stayMs )
	}

	setTimeout( popOnce, 5000 )
}

function runTerminalAnimation(): void {
	const body = document.getElementById( 'landing-terminal-body' )
	if ( !body ) {
		return
	}

	const commandText =
		'$ curl -s \\\n' +
		'  "https://en.wikipedia.org/w/rest.php/v1/page/Octopus" \\\n' +
		'  -H "Accept: application/json" | jq \'.\''

	function renderJson( obj: Record<string, unknown>, indent = 0 ): string {
		const pad = '  '.repeat( indent )
		const padInner = '  '.repeat( indent + 1 )
		let out = '<span class="t-white">{</span>\n'
		const keys = Object.keys( obj )
		keys.forEach( ( k, i ) => {
			const v = obj[ k ]
			const comma = i < keys.length - 1 ? '<span class="t-dim">,</span>' : ''
			out += padInner
			out += `<span class="t-key">"${ k }"</span><span class="t-dim">: </span>`
			if ( typeof v === 'string' ) {
				out += `<span class="t-str">"${ v }"</span>`
			} else if ( typeof v === 'number' ) {
				out += `<span class="t-num">${ v }</span>`
			} else if ( typeof v === 'boolean' ) {
				out += `<span class="t-bool">${ v }</span>`
			} else if ( v === null ) {
				out += '<span class="t-bool">null</span>'
			} else if ( typeof v === 'object' ) {
				out += renderJson( v as Record<string, unknown>, indent + 1 )
			}
			out += comma + '\n'
		} )
		out += pad + '<span class="t-white">}</span>'
		return out
	}

	const commentEl = document.createElement( 'div' )
	commentEl.style.cssText = 'font-family:var(--landing-font-mono);font-size:13px;line-height:1.6;white-space:pre;'
	commentEl.innerHTML = '<span class="t-comment"># Query the Wikipedia REST API</span>\n\n'
	body.appendChild( commentEl )

	const cmdEl = document.createElement( 'div' )
	cmdEl.style.cssText = 'font-family:var(--landing-font-mono);font-size:13px;line-height:1.6;white-space:pre;'
	body.appendChild( cmdEl )

	const cursor = document.createElement( 'span' )
	cursor.className = 'landing-cursor'
	body.appendChild( cursor )

	let pos = 0
	function typeNext(): void {
		if ( pos <= commandText.length ) {
			const chunk = commandText.slice( 0, pos )
			const colored = chunk
				.replace( /\$/g, '<span class="t-prompt">$</span>' )
				.replace( /\bcurl\b/g, '<span class="t-method">curl</span>' )
				.replace( /(https:\/\/[^\s"\\]+)/g, '<span class="t-url">$1</span>' )
				.replace( /\bjq\b/g, '<span class="t-method">jq</span>' )
				.replace( /'\.'/g, '<span class="t-str">\'.\'</span>' )
				.replace( /(-s\b|-H\b)/g, '<span class="t-dim">$1</span>' )
				.replace( /"Accept: application\/json"/g, '<span class="t-str">"Accept: application/json"</span>' )
			cmdEl.innerHTML = colored
			pos++
			setTimeout( typeNext, pos < 4 ? 100 : pos > commandText.length - 5 ? 60 : 20 )
		} else {
			cursor.remove()
			const blankEl = document.createElement( 'div' )
			blankEl.innerHTML = '\n'
			body.appendChild( blankEl )
			setTimeout( () => {
				const respEl = document.createElement( 'div' )
				respEl.style.cssText =
					'font-family:var(--landing-font-mono);font-size:12.5px;line-height:1.65;white-space:pre;opacity:0;transition:opacity 0.6s;'
				respEl.innerHTML = renderJson( {
					title: 'Octopus',
					key: 'octopus',
					latest: { id: 1190724332, timestamp: '2024-11-18T10:02:11Z' },
					content_model: 'wikitext',
					license: {
						url: '//creativecommons.org/licenses/by-sa/4.0/',
						title: 'Creative Commons Attribution-Share Alike 4.0'
					}
				} )
				body.appendChild( respEl )
				requestAnimationFrame( () => {
					requestAnimationFrame( () => {
						respEl.style.opacity = '1'
					} )
				} )
			}, 400 )
		}
	}
	setTimeout( typeNext, 600 )
}
</script>

<template>
	<div class="landing">
		<a href="#landing-main" class="landing-skip">Skip to main content</a>

		<nav class="landing-nav" aria-label="Site navigation">
			<div class="landing-nav__inner">
				<NuxtLink to="/" class="landing-nav__logo" aria-label="Wikimedia Developer Portal home">
					<img
						src="/wikimedia-logo-white.svg"
						alt="Wikimedia"
						width="32"
						height="32"
					>
					<span class="landing-nav__logo-text">
						Wikimedia
						<span class="landing-nav__logo-sub">Developer Portal</span>
					</span>
				</NuxtLink>
				<ul class="landing-nav__links">
					<li><NuxtLink to="/explorer">
						REST APIs
					</NuxtLink></li>
					<li><NuxtLink to="/learn">
						Pathways
					</NuxtLink></li>
					<li><NuxtLink to="/about">
						About
					</NuxtLink></li>
					<li><NuxtLink to="/community">
						Community
					</NuxtLink></li>
					<li><NuxtLink to="/explorer" class="landing-nav__cta">
						API Explorer &rarr;
					</NuxtLink></li>
				</ul>
			</div>
		</nav>

		<section class="landing-hero" aria-labelledby="landing-hero-headline">
			<div class="landing-hero__dots" aria-hidden="true" />
			<div class="landing-hero__glow" aria-hidden="true" />
			<div class="landing-hero__inner">
				<div class="landing-hero__copy">
					<div class="landing-hero__eyebrow">
						<span class="landing-hero__eyebrow-dot" aria-hidden="true" />
						REST APIs &middot; SDKs &middot; Bots &middot; Open Source
					</div>
					<h1 id="landing-hero-headline" class="landing-hero__headline">
						Build on the world's <em>free knowledge</em> infrastructure
					</h1>
					<p class="landing-hero__desc">
						Wikimedia's APIs power thousands of apps, tools, and bots.
						Explore live REST endpoints, find your pathway into Wikimedia
						development, and connect with a global community of contributors.
					</p>
					<div class="landing-hero__actions">
						<a href="#landing-api" class="landing-btn landing-btn--primary">
							Explore the APIs <span aria-hidden="true">&rarr;</span>
						</a>
						<a href="#landing-pathways" class="landing-btn landing-btn--secondary">
							Find your pathway <span aria-hidden="true">&rarr;</span>
						</a>
					</div>
					<div class="landing-hero__stats" role="list">
						<div class="landing-hero__stat" role="listitem">
							<div class="landing-hero__stat-num">60M+</div>
							<div class="landing-hero__stat-label">Articles indexed</div>
						</div>
						<div class="landing-hero__stat" role="listitem">
							<div class="landing-hero__stat-num">300+</div>
							<div class="landing-hero__stat-label">Language editions</div>
						</div>
						<div class="landing-hero__stat" role="listitem">
							<div class="landing-hero__stat-num">~50K</div>
							<div class="landing-hero__stat-label">API req/s served</div>
						</div>
					</div>
				</div>

				<div
					class="landing-terminal-wrap"
					role="img"
					aria-label="Animated terminal showing a sample Wikimedia REST API request and JSON response"
				>
					<img
						id="landing-babyglobe"
						class="landing-babyglobe"
						alt=""
						aria-hidden="true"
					>
					<div class="landing-terminal">
						<div class="landing-terminal__bar" aria-hidden="true">
							<span class="landing-terminal__dot" />
							<span class="landing-terminal__dot" />
							<span class="landing-terminal__dot" />
							<span class="landing-terminal__title">wikimedia-api-demo.sh</span>
						</div>
						<div
							id="landing-terminal-body"
							class="landing-terminal__body"
							aria-live="polite"
						/>
					</div>
					<div class="landing-terminal__badge" aria-hidden="true">
						&#x2726; Try it live in the API Explorer
					</div>
				</div>
			</div>
			<svg
				class="landing-hero__wave"
				viewBox="0 0 1440 72"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				preserveAspectRatio="none"
			>
				<path d="M0 72V32C240 -8 480 48 720 32C960 16 1200 56 1440 32V72H0Z" fill="white" />
			</svg>
		</section>

		<section id="landing-api" class="landing-api" aria-labelledby="landing-api-title">
			<div class="landing-api__inner">
				<div class="landing-api__copy">
					<div class="landing-section-label">
						REST APIs
					</div>
					<h2 id="landing-api-title" class="landing-section-title">
						Explore, test, and integrate with live documentation
					</h2>
					<p class="landing-section-desc">
						Wikimedia's REST APIs let you query articles, media, page history,
						search, user data, and more &mdash; across every language edition. Fire
						live requests and inspect responses right in your browser.
					</p>
					<ul class="landing-api__features">
						<li>
							<span class="landing-api__feature-icon" aria-hidden="true">&lang;&rang;</span>
							Try requests with real data &mdash; no auth required for read endpoints
						</li>
						<li>
							<span class="landing-api__feature-icon" aria-hidden="true">&equiv;</span>
							Full OpenAPI specs with schemas, error codes, and examples
						</li>
						<li>
							<span class="landing-api__feature-icon" aria-hidden="true">&#x25F7;</span>
							Rate limit details, versioning notes, and migration guides
						</li>
						<li>
							<span class="landing-api__feature-icon" aria-hidden="true">&#x2726;</span>
							Generated SDK snippets in Python, JavaScript, and cURL
						</li>
					</ul>
					<NuxtLink to="/explorer" class="landing-btn landing-btn--dark">
						Open API Explorer &rarr;
					</NuxtLink>
				</div>

				<div class="landing-api__endpoints" role="list" aria-label="Sample API endpoints">
					<div class="landing-api__endpoints-label">
						Sample endpoints
					</div>
					<NuxtLink to="/explorer" class="landing-endpoint landing-endpoint--featured" role="listitem">
						<span class="landing-method landing-method--get">GET</span>
						<span class="landing-endpoint__path">/w/rest.php/v1/page/{title}</span>
						<span class="landing-endpoint__desc">Article content</span>
					</NuxtLink>
					<NuxtLink to="/explorer" class="landing-endpoint" role="listitem">
						<span class="landing-method landing-method--get">GET</span>
						<span class="landing-endpoint__path">/w/rest.php/v1/search/page</span>
						<span class="landing-endpoint__desc">Full-text search</span>
					</NuxtLink>
					<NuxtLink to="/explorer" class="landing-endpoint" role="listitem">
						<span class="landing-method landing-method--get">GET</span>
						<span class="landing-endpoint__path">/w/rest.php/v1/page/{title}/history</span>
						<span class="landing-endpoint__desc">Revision history</span>
					</NuxtLink>
					<NuxtLink to="/explorer" class="landing-endpoint" role="listitem">
						<span class="landing-method landing-method--get">GET</span>
						<span class="landing-endpoint__path">/api/rest_v1/media/math/render/{type}</span>
						<span class="landing-endpoint__desc">Math rendering</span>
					</NuxtLink>
					<NuxtLink to="/explorer" class="landing-endpoint" role="listitem">
						<span class="landing-method landing-method--post">POST</span>
						<span class="landing-endpoint__path">/w/rest.php/v1/page/{title}</span>
						<span class="landing-endpoint__desc">Create/update page</span>
					</NuxtLink>
					<NuxtLink to="/explorer" class="landing-endpoint" role="listitem">
						<span class="landing-method landing-method--get">GET</span>
						<span class="landing-endpoint__path">/w/rest.php/v1/user/{name}</span>
						<span class="landing-endpoint__desc">User profile</span>
					</NuxtLink>
					<div class="landing-api__endpoints-footer">
						<NuxtLink to="/explorer">
							View all 80+ endpoints in the Explorer &rarr;
						</NuxtLink>
					</div>
				</div>
			</div>
		</section>

		<section
			id="landing-pathways"
			class="landing-pathways"
			aria-labelledby="landing-pathways-title"
		>
			<div class="landing-pathways__inner">
				<div class="landing-section-header">
					<div class="landing-section-label">
						Developer pathways
					</div>
					<h2 id="landing-pathways-title" class="landing-section-title">
						Where do you want to go?
					</h2>
					<p class="landing-section-desc">
						Whether you're building an app, automating edits, fixing bugs in
						MediaWiki, or just finding your footing &mdash; there's a path for you.
					</p>
				</div>

				<div id="landing-main" class="landing-pathways__grid">
					<div class="landing-pathways__row landing-pathways__row--3" role="list">
						<NuxtLink to="/learn" class="landing-card landing-card--data" role="listitem">
							<div class="landing-card__icon landing-card__icon--data" aria-hidden="true">
								<svg viewBox="0 0 26 26" fill="none" width="26" height="26">
									<ellipse cx="13" cy="8" rx="9" ry="3.5" stroke="#3366CC" stroke-width="1.5" />
									<path d="M4 8v5c0 1.93 4.03 3.5 9 3.5S22 14.93 22 13V8" stroke="#3366CC" stroke-width="1.5" />
									<path d="M4 13v5c0 1.93 4.03 3.5 9 3.5s9-1.57 9-3.5v-5" stroke="#3366CC" stroke-width="1.5" />
								</svg>
							</div>
							<div class="landing-card__tags">
								<span class="landing-card__tag">REST API</span>
								<span class="landing-card__tag">Data</span>
							</div>
							<h3 class="landing-card__title">
								Use Wikipedia's data in your project
							</h3>
							<p class="landing-card__desc">
								Query article content, search across editions, access structured
								data from Wikidata, and stream real-time edits. Power research
								apps, visualizations, and AI training pipelines.
							</p>
							<ul class="landing-card__links" aria-label="Resources">
								<li><span class="landing-card__link">REST API quickstart &rarr;</span></li>
								<li><span class="landing-card__link">Wikidata Query Service &rarr;</span></li>
								<li><span class="landing-card__link">EventStreams (live edits) &rarr;</span></li>
							</ul>
						</NuxtLink>

						<NuxtLink to="/learn" class="landing-card landing-card--bots" role="listitem">
							<div class="landing-card__icon landing-card__icon--bots" aria-hidden="true">
								<svg viewBox="0 0 26 26" fill="none" width="26" height="26">
									<rect x="7" y="9" width="12" height="10" rx="2" stroke="#1A6636" stroke-width="1.5" />
									<path d="M10 9V7a3 3 0 0 1 6 0v2" stroke="#1A6636" stroke-width="1.5" />
									<circle cx="10.5" cy="14" r="1" fill="#1A6636" />
									<circle cx="15.5" cy="14" r="1" fill="#1A6636" />
									<path d="M11 17h4" stroke="#1A6636" stroke-width="1.5" stroke-linecap="round" />
								</svg>
							</div>
							<div class="landing-card__tags">
								<span class="landing-card__tag">Bots</span>
								<span class="landing-card__tag">Automation</span>
							</div>
							<h3 class="landing-card__title">
								Create bots and tools
							</h3>
							<p class="landing-card__desc">
								Automate edits, detect vandalism, generate reports, and build
								maintenance tools. Learn about bot policy, get your bot
								approved, and write your first automated edit.
							</p>
							<ul class="landing-card__links" aria-label="Resources">
								<li><span class="landing-card__link">Bot policy &amp; approval &rarr;</span></li>
								<li><span class="landing-card__link">Pywikibot framework &rarr;</span></li>
								<li><span class="landing-card__link">OAuth for bot accounts &rarr;</span></li>
							</ul>
						</NuxtLink>

						<NuxtLink to="/contribute" class="landing-card landing-card--oss" role="listitem">
							<div class="landing-card__icon landing-card__icon--oss" aria-hidden="true">
								<svg viewBox="0 0 26 26" fill="none" width="26" height="26">
									<circle cx="13" cy="13" r="9" stroke="#1D6AA5" stroke-width="1.5" />
									<path d="M9 13a4 4 0 0 0 4 4m0 0a4 4 0 0 0 4-4m-4 4v-4m0 0a4 4 0 0 0-4-4m4 4a4 4 0 0 1 4-4" stroke="#1D6AA5" stroke-width="1.5" />
								</svg>
							</div>
							<div class="landing-card__tags">
								<span class="landing-card__tag">Open source</span>
								<span class="landing-card__tag">MediaWiki</span>
							</div>
							<h3 class="landing-card__title">
								Contribute to Wikimedia open source
							</h3>
							<p class="landing-card__desc">
								MediaWiki, VisualEditor, Parsoid, and hundreds of extensions are
								fully open source. Find a good first task, set up your dev
								environment, and submit your first patch to Gerrit.
							</p>
							<ul class="landing-card__links" aria-label="Resources">
								<li><span class="landing-card__link">Good first bugs (Phabricator) &rarr;</span></li>
								<li><span class="landing-card__link">MediaWiki dev setup &rarr;</span></li>
								<li><span class="landing-card__link">Code review on Gerrit &rarr;</span></li>
							</ul>
						</NuxtLink>
					</div>

					<div class="landing-pathways__row landing-pathways__row--2" role="list">
						<NuxtLink to="/community" class="landing-card landing-card--community" role="listitem">
							<div class="landing-card__icon landing-card__icon--community" aria-hidden="true">
								<svg viewBox="0 0 26 26" fill="none" width="26" height="26">
									<circle cx="10" cy="10" r="3" stroke="#7A4800" stroke-width="1.5" />
									<circle cx="18" cy="10" r="3" stroke="#7A4800" stroke-width="1.5" />
									<path d="M4 22c0-3.31 2.69-6 6-6" stroke="#7A4800" stroke-width="1.5" stroke-linecap="round" />
									<path d="M14 22c0-3.31 2.69-6 6-6" stroke="#7A4800" stroke-width="1.5" stroke-linecap="round" />
									<path d="M14 16c-1.1-.64-2.15-1-3.5-1" stroke="#7A4800" stroke-width="1.5" stroke-linecap="round" />
								</svg>
							</div>
							<div class="landing-card__tags">
								<span class="landing-card__tag">Community</span>
								<span class="landing-card__tag">Events</span>
							</div>
							<h3 class="landing-card__title">
								Connect with the community
							</h3>
							<p class="landing-card__desc">
								Join developer channels on IRC and Matrix, attend Wikimania and
								hackathons, participate in Google Summer of Code and Outreachy,
								and find your niche in the movement.
							</p>
							<ul class="landing-card__links" aria-label="Resources">
								<li><span class="landing-card__link">Developer mailing list &rarr;</span></li>
								<li><span class="landing-card__link">Hackathons &amp; events &rarr;</span></li>
								<li><span class="landing-card__link">GSoC / Outreachy &rarr;</span></li>
							</ul>
						</NuxtLink>

						<NuxtLink to="/get-help" class="landing-card landing-card--help" role="listitem">
							<div class="landing-card__icon landing-card__icon--help" aria-hidden="true">
								<svg viewBox="0 0 26 26" fill="none" width="26" height="26">
									<circle cx="13" cy="13" r="9" stroke="#8C1F1F" stroke-width="1.5" />
									<path d="M10.5 10.5a2.5 2.5 0 1 1 2.5 2.5V15" stroke="#8C1F1F" stroke-width="1.5" stroke-linecap="round" />
									<circle cx="13" cy="18" r="0.75" fill="#8C1F1F" />
								</svg>
							</div>
							<div class="landing-card__tags">
								<span class="landing-card__tag">Support</span>
								<span class="landing-card__tag">Docs</span>
							</div>
							<h3 class="landing-card__title">
								Get help
							</h3>
							<p class="landing-card__desc">
								Can't find what you need? Browse the developer FAQ, ask on the
								technical village pump, or open a task in Phabricator. The
								community is welcoming to newcomers at every level.
							</p>
							<ul class="landing-card__links" aria-label="Resources">
								<li><span class="landing-card__link">Developer FAQ &rarr;</span></li>
								<li><span class="landing-card__link">Technical village pump &rarr;</span></li>
								<li><span class="landing-card__link">Report a bug &rarr;</span></li>
							</ul>
						</NuxtLink>
					</div>
				</div>
			</div>
		</section>

		<section class="landing-community" aria-labelledby="landing-community-title">
			<div class="landing-community__inner">
				<div class="landing-community__text">
					<h2 id="landing-community-title">
						Talk to a human, not just the docs
					</h2>
					<p>
						Our developer community is active, global, and genuinely welcoming.
						Drop into IRC, ask on the mailing list, or browse the wiki.
					</p>
				</div>
				<div class="landing-community__channels" role="list">
					<a href="https://meta.wikimedia.org/wiki/IRC" class="landing-channel-btn" role="listitem">
						IRC / Matrix
					</a>
					<a href="https://lists.wikimedia.org/postorius/lists/wikitech-l.lists.wikimedia.org/" class="landing-channel-btn" role="listitem">
						Mailing list
					</a>
					<a href="https://github.com/wikimedia" class="landing-channel-btn" role="listitem">
						GitHub
					</a>
					<a href="https://www.mediawiki.org/wiki/MediaWiki" class="landing-channel-btn" role="listitem">
						mediawiki.org
					</a>
				</div>
			</div>
		</section>

		<footer class="landing-footer" aria-label="Site footer">
			<div class="landing-footer__inner">
				<div class="landing-footer__brand">
					<img src="/wikimedia-logo-white.svg" alt="" width="20" height="20" aria-hidden="true">
					Wikimedia Developer Portal
				</div>
				<ul class="landing-footer__links">
					<li><a href="https://foundation.wikimedia.org/wiki/Policy:Privacy_policy">Privacy policy</a></li>
					<li><a href="https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use">Terms of use</a></li>
					<li><a href="https://www.mediawiki.org/wiki/Code_of_Conduct">Code of conduct</a></li>
					<li><a href="https://github.com/wikimedia">GitHub</a></li>
				</ul>
				<p class="landing-footer__copy">
					Content available under
					<a href="https://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike</a>
					unless otherwise noted. Wikimedia Foundation is a registered trademark.
				</p>
			</div>
		</footer>
	</div>
</template>

<style scoped>
.landing {
	--landing-deep-blue: #054C7C;
	--landing-mid-blue: #1D6AA5;
	--landing-link-blue: #3366CC;
	--landing-light-blue: #EAF3FB;
	--landing-gold: #FFCC33;
	--landing-base: #FAFAF8;
	--landing-border: #DDE8F2;
	--landing-text-primary: #1C1C1C;
	--landing-text-secondary: #54606E;
	--landing-text-muted: #8A96A2;
	--landing-code-bg: #0D2137;
	--landing-font-display: 'Space Grotesk', system-ui, sans-serif;
	--landing-font-body: 'Inter', system-ui, sans-serif;
	--landing-font-mono: 'JetBrains Mono', 'Fira Code', monospace;
	--landing-radius-sm: 6px;
	--landing-radius-md: 10px;
	--landing-radius-lg: 16px;
	--landing-radius-xl: 20px;
	--landing-shadow-card: 0 1px 3px rgba( 5, 76, 124, 0.08 ), 0 4px 16px rgba( 5, 76, 124, 0.06 );
	--landing-shadow-card-hover: 0 4px 12px rgba( 5, 76, 124, 0.14 ), 0 12px 40px rgba( 5, 76, 124, 0.10 );

	font-family: var( --landing-font-body );
	background: var( --landing-base );
	color: var( --landing-text-primary );
	-webkit-font-smoothing: antialiased;
	overflow-x: clip;
}

.landing-skip {
	position: absolute;
	top: -100px;
	left: 1rem;
	background: var( --landing-deep-blue );
	color: white;
	padding: 8px 16px;
	border-radius: var( --landing-radius-sm );
	font-family: var( --landing-font-display );
	font-size: 14px;
	text-decoration: none;
	z-index: 9999;
	transition: top 0.2s;
}
.landing-skip:focus { top: 1rem; }

.landing-nav {
	position: sticky;
	top: 0;
	z-index: 100;
	background: rgba( 5, 76, 124, 0.97 );
	backdrop-filter: blur( 8px );
	border-bottom: 1px solid rgba( 255, 255, 255, 0.08 );
}
.landing-nav__inner {
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 2rem;
	display: flex;
	align-items: center;
	gap: 2rem;
	height: 56px;
}
.landing-nav__logo {
	display: flex;
	align-items: center;
	gap: 10px;
	text-decoration: none;
	color: white;
	flex-shrink: 0;
}
.landing-nav__logo-text {
	font-family: var( --landing-font-display );
	font-size: 17px;
	font-weight: 700;
	letter-spacing: -0.01em;
	line-height: 1.2;
}
.landing-nav__logo-sub {
	font-size: 11px;
	font-weight: 400;
	opacity: 0.65;
	letter-spacing: 0.04em;
	display: block;
}
.landing-nav__links {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	margin-inline-start: auto;
	list-style: none;
	padding: 0;
	margin-block: 0;
}
.landing-nav__links a {
	color: rgba( 255, 255, 255, 0.8 );
	text-decoration: none;
	font-size: 14px;
	font-family: var( --landing-font-display );
	padding: 6px 12px;
	border-radius: var( --landing-radius-sm );
	transition: color 0.15s, background 0.15s;
}
.landing-nav__links a:hover {
	color: white;
	background: rgba( 255, 255, 255, 0.1 );
}
.landing-nav__cta {
	background: rgba( 255, 255, 255, 0.12 ) !important;
	border: 1px solid rgba( 255, 255, 255, 0.25 ) !important;
	font-weight: 500 !important;
}
.landing-nav__cta:hover {
	background: rgba( 255, 255, 255, 0.22 ) !important;
}

.landing-hero {
	background: var( --landing-deep-blue );
	position: relative;
	overflow: hidden;
	padding: 5rem 2rem 0;
}
.landing-hero__dots {
	position: absolute;
	inset: 0;
	background-image: radial-gradient( circle, rgba( 255, 255, 255, 0.07 ) 1px, transparent 1px );
	background-size: 28px 28px;
	pointer-events: none;
}
.landing-hero__glow {
	position: absolute;
	width: 600px;
	height: 600px;
	border-radius: 50%;
	background: radial-gradient( circle, rgba( 51, 102, 204, 0.22 ) 0%, transparent 70% );
	top: -200px;
	right: -100px;
	pointer-events: none;
}
.landing-hero__inner {
	max-width: 1200px;
	margin: 0 auto;
	position: relative;
	z-index: 1;
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 4rem;
	align-items: start;
}
.landing-hero__eyebrow {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	background: rgba( 255, 255, 255, 0.1 );
	border: 1px solid rgba( 255, 255, 255, 0.15 );
	color: rgba( 255, 255, 255, 0.9 );
	font-size: 12px;
	font-family: var( --landing-font-display );
	font-weight: 500;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	padding: 6px 14px;
	border-radius: 100px;
	margin-bottom: 1.5rem;
}
.landing-hero__eyebrow-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: var( --landing-gold );
	animation: landing-pulse 2s ease-in-out infinite;
}
@keyframes landing-pulse {
	0%, 100% { opacity: 1; transform: scale( 1 ); }
	50% { opacity: 0.5; transform: scale( 0.7 ); }
}
.landing-hero__headline {
	font-family: var( --landing-font-display );
	font-size: clamp( 2.2rem, 4vw, 3.2rem );
	font-weight: 700;
	line-height: 1.1;
	color: white;
	letter-spacing: -0.02em;
	margin-bottom: 1.25rem;
	margin-block-start: 0;
}
.landing-hero__headline em {
	font-style: normal;
	color: var( --landing-gold );
}
.landing-hero__desc {
	font-size: 1.05rem;
	color: rgba( 255, 255, 255, 0.72 );
	line-height: 1.7;
	margin-bottom: 2rem;
	max-width: 480px;
}
.landing-hero__actions {
	display: flex;
	gap: 12px;
	flex-wrap: wrap;
	margin-bottom: 3.5rem;
}
.landing-hero__stats {
	display: flex;
	gap: 2.5rem;
}
.landing-hero__stat-num {
	font-family: var( --landing-font-display );
	font-size: 1.6rem;
	font-weight: 700;
	color: white;
	line-height: 1;
	margin-bottom: 4px;
}
.landing-hero__stat-label {
	font-size: 12px;
	color: rgba( 255, 255, 255, 0.5 );
	letter-spacing: 0.04em;
}

.landing-btn {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	font-family: var( --landing-font-display );
	font-weight: 600;
	font-size: 15px;
	padding: 12px 24px;
	border-radius: var( --landing-radius-md );
	text-decoration: none;
	transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
}
.landing-btn--primary {
	background: white;
	color: var( --landing-deep-blue );
}
.landing-btn--primary:hover {
	transform: translateY( -1px );
	box-shadow: 0 6px 20px rgba( 0, 0, 0, 0.25 );
	color: var( --landing-deep-blue );
}
.landing-btn--secondary {
	background: transparent;
	color: rgba( 255, 255, 255, 0.9 );
	border: 1px solid rgba( 255, 255, 255, 0.3 );
}
.landing-btn--secondary:hover {
	background: rgba( 255, 255, 255, 0.08 );
	border-color: rgba( 255, 255, 255, 0.5 );
	color: white;
}
.landing-btn--dark {
	background: var( --landing-deep-blue );
	color: white;
}
.landing-btn--dark:hover {
	transform: translateY( -1px );
	box-shadow: 0 6px 20px rgba( 5, 76, 124, 0.3 );
	color: white;
}

.landing-terminal-wrap {
	position: relative;
}
.landing-terminal-wrap .landing-terminal {
	position: relative;
	z-index: 1;
}
.landing-babyglobe {
	position: absolute;
	width: 96px;
	height: 96px;
	pointer-events: none;
	opacity: 0;
	z-index: 0;
	transition:
		transform 0.65s cubic-bezier( 0.34, 1.56, 0.64, 1 ),
		opacity 0.4s ease-out;
	filter: drop-shadow( 0 8px 16px rgba( 0, 0, 0, 0.35 ) );
}
.landing-babyglobe[data-pos="br"] {
	bottom: -70px;
	right: -70px;
	transform: translate( -40px, -40px ) scale( 0.5 ) rotate( -15deg );
}
.landing-babyglobe[data-pos="tr"] {
	top: -70px;
	right: -70px;
	transform: translate( -40px, 40px ) scale( 0.5 ) rotate( 15deg );
}
.landing-babyglobe[data-pos="r"] {
	top: 50%;
	right: -80px;
	margin-top: -48px;
	transform: translate( -40px, 0 ) scale( 0.5 );
}
.landing-babyglobe.is-visible[data-pos="br"] {
	transform: translate( 0, 0 ) scale( 1 ) rotate( 6deg );
	opacity: 1;
}
.landing-babyglobe.is-visible[data-pos="tr"] {
	transform: translate( 0, 0 ) scale( 1 ) rotate( -6deg );
	opacity: 1;
}
.landing-babyglobe.is-visible[data-pos="r"] {
	transform: translate( 0, 0 ) scale( 1 );
	opacity: 1;
}
/* On narrower viewports the terminal sits flush against the viewport edge, so
   the desktop offsets push the globe entirely off-screen. Shrink it and pull
   it back closer to the terminal so it still peeks out. */
@media ( max-width: 900px ) {
	.landing-babyglobe {
		width: 72px;
		height: 72px;
	}
	/* On narrow viewports the terminal is full-width, so peek above or below
	   the terminal instead of from the side. Resting Y is shifted *into* the
	   terminal so the globe rises/drops out of view when it pops. */
	.landing-babyglobe[data-pos="t"] {
		top: -60px;
		left: 50%;
		transform: translate( -50%, 30px ) scale( 0.5 ) rotate( -8deg );
	}
	.landing-babyglobe[data-pos="b"] {
		bottom: -60px;
		left: 78%;
		transform: translate( -50%, -30px ) scale( 0.5 ) rotate( 8deg );
	}
	.landing-babyglobe.is-visible[data-pos="t"] {
		transform: translate( -50%, 0 ) scale( 1 ) rotate( -4deg );
		opacity: 1;
	}
	.landing-babyglobe.is-visible[data-pos="b"] {
		transform: translate( -50%, 0 ) scale( 1 ) rotate( 4deg );
		opacity: 1;
	}
	/* Fallback for the desktop position values, in case the viewport crosses
	   the 900px threshold mid-animation. */
	.landing-babyglobe[data-pos="br"] {
		bottom: -36px;
		right: -24px;
		transform: translate( -20px, -20px ) scale( 0.5 ) rotate( -15deg );
	}
	.landing-babyglobe[data-pos="tr"] {
		top: -36px;
		right: -24px;
		transform: translate( -20px, 20px ) scale( 0.5 ) rotate( 15deg );
	}
	.landing-babyglobe[data-pos="r"] {
		right: -36px;
		margin-top: -36px;
		transform: translate( -20px, 0 ) scale( 0.5 );
	}
}
.landing-terminal {
	background: var( --landing-code-bg );
	border-radius: var( --landing-radius-lg );
	overflow: hidden;
	border: 1px solid rgba( 255, 255, 255, 0.1 );
	font-family: var( --landing-font-mono );
	font-size: 13px;
	line-height: 1.6;
	box-shadow: 0 24px 64px rgba( 0, 0, 0, 0.4 );
}
.landing-terminal__bar {
	background: rgba( 255, 255, 255, 0.06 );
	border-bottom: 1px solid rgba( 255, 255, 255, 0.07 );
	padding: 12px 16px;
	display: flex;
	align-items: center;
	gap: 8px;
}
.landing-terminal__dot {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	display: inline-block;
}
.landing-terminal__dot:nth-child( 1 ) { background: #FF5F57; }
.landing-terminal__dot:nth-child( 2 ) { background: #FFBD2E; }
.landing-terminal__dot:nth-child( 3 ) { background: #28C840; }
.landing-terminal__title {
	margin-inline-start: auto;
	font-size: 11px;
	color: rgba( 255, 255, 255, 0.3 );
}
.landing-terminal__body {
	padding: 20px;
	min-height: 320px;
}
.landing-terminal__badge {
	position: absolute;
	bottom: -14px;
	left: 50%;
	z-index: 2;
	transform: translateX( -50% );
	background: var( --landing-gold );
	color: #1C1C1C;
	font-family: var( --landing-font-display );
	font-size: 11px;
	font-weight: 600;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	padding: 5px 14px;
	border-radius: 100px;
	white-space: nowrap;
	box-shadow: 0 2px 12px rgba( 0, 0, 0, 0.2 );
}

:deep( .t-comment ) { color: #587A8B; }
:deep( .t-method )  { color: #E8A0BF; }
:deep( .t-url )     { color: #7EC4CF; }
:deep( .t-key )     { color: #A8D8EA; }
:deep( .t-str )     { color: #7EC4CF; }
:deep( .t-num )     { color: #FAC75A; }
:deep( .t-bool )    { color: #B5E48C; }
:deep( .t-prompt )  { color: rgba( 255, 255, 255, 0.4 ); }
:deep( .t-white )   { color: rgba( 255, 255, 255, 0.9 ); }
:deep( .t-dim )     { color: rgba( 255, 255, 255, 0.35 ); }
:deep( .landing-cursor ) {
	display: inline-block;
	width: 8px;
	height: 15px;
	background: rgba( 255, 255, 255, 0.7 );
	border-radius: 1px;
	vertical-align: middle;
	animation: landing-blink 1s step-end infinite;
}
@keyframes landing-blink {
	0%, 100% { opacity: 1; }
	50% { opacity: 0; }
}

.landing-hero__wave {
	display: block;
	width: 100%;
	margin-top: 5rem;
}

.landing-section-label {
	font-family: var( --landing-font-display );
	font-size: 12px;
	font-weight: 600;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: var( --landing-mid-blue );
	margin-bottom: 0.75rem;
}
.landing-section-title {
	font-family: var( --landing-font-display );
	font-size: clamp( 1.6rem, 3vw, 2.2rem );
	font-weight: 700;
	letter-spacing: -0.02em;
	color: var( --landing-text-primary );
	line-height: 1.15;
	margin-bottom: 1rem;
	margin-block-start: 0;
}
.landing-section-desc {
	font-size: 1rem;
	color: var( --landing-text-secondary );
	line-height: 1.7;
	max-width: 560px;
}
.landing-section-header {
	margin-bottom: 3rem;
}

.landing-api {
	background: white;
	padding: 5rem 2rem;
	border-bottom: 1px solid var( --landing-border );
}
.landing-api__inner {
	max-width: 1200px;
	margin: 0 auto;
	display: grid;
	grid-template-columns: 1fr 1.1fr;
	gap: 5rem;
	align-items: center;
}
.landing-api__features {
	list-style: none;
	padding: 0;
	margin: 1.75rem 0 2rem;
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.landing-api__features li {
	display: flex;
	align-items: flex-start;
	gap: 12px;
	font-size: 15px;
	color: var( --landing-text-secondary );
}
.landing-api__feature-icon {
	width: 28px;
	height: 28px;
	border-radius: 8px;
	background: var( --landing-light-blue );
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	color: var( --landing-mid-blue );
	font-size: 13px;
}
.landing-api__endpoints {
	background: var( --landing-light-blue );
	border-radius: var( --landing-radius-xl );
	padding: 2rem;
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.landing-api__endpoints-label {
	font-family: var( --landing-font-display );
	font-size: 13px;
	font-weight: 600;
	color: var( --landing-text-secondary );
	text-transform: uppercase;
	letter-spacing: 0.08em;
	margin-bottom: 4px;
}
.landing-endpoint {
	background: white;
	border-radius: var( --landing-radius-md );
	padding: 14px 18px;
	display: flex;
	align-items: center;
	gap: 12px;
	border: 1px solid var( --landing-border );
	cursor: pointer;
	transition: box-shadow 0.15s, transform 0.15s;
	text-decoration: none;
	color: inherit;
}
.landing-endpoint:hover {
	box-shadow: var( --landing-shadow-card );
	transform: translateY( -1px );
	color: inherit;
}
.landing-endpoint--featured {
	border-color: var( --landing-mid-blue );
	box-shadow: 0 0 0 3px rgba( 29, 106, 165, 0.12 );
}
.landing-method {
	font-family: var( --landing-font-mono );
	font-size: 11px;
	font-weight: 500;
	padding: 3px 8px;
	border-radius: var( --landing-radius-sm );
	flex-shrink: 0;
}
.landing-method--get  { background: #E0F5EA; color: #1A6636; }
.landing-method--post { background: #FFF2E0; color: #7A4800; }
.landing-endpoint__path {
	font-family: var( --landing-font-mono );
	font-size: 13px;
	color: var( --landing-text-primary );
	flex: 1;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.landing-endpoint__desc {
	font-size: 12px;
	color: var( --landing-text-muted );
	white-space: nowrap;
}
.landing-api__endpoints-footer {
	text-align: center;
	padding-top: 4px;
}
.landing-api__endpoints-footer a {
	font-family: var( --landing-font-display );
	font-size: 13px;
	font-weight: 600;
	color: var( --landing-link-blue );
	text-decoration: none;
}
.landing-api__endpoints-footer a:hover { text-decoration: underline; }

.landing-pathways {
	padding: 5rem 2rem;
	background: var( --landing-base );
}
.landing-pathways__inner {
	max-width: 1200px;
	margin: 0 auto;
}
.landing-pathways__grid {
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
	margin-top: 3rem;
}
.landing-pathways__row {
	display: grid;
	gap: 1.25rem;
}
.landing-pathways__row--3 {
	grid-template-columns: repeat( 3, 1fr );
}
.landing-pathways__row--2 {
	grid-template-columns: repeat( 2, 1fr );
	max-width: calc( 66.66% - 0.42rem );
	margin-inline: auto;
	width: 100%;
}

.landing-card {
	background: white;
	border-radius: var( --landing-radius-xl );
	padding: 2rem;
	border: 1px solid var( --landing-border );
	box-shadow: var( --landing-shadow-card );
	text-decoration: none;
	color: inherit;
	display: flex;
	flex-direction: column;
	transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
	position: relative;
	overflow: hidden;
}
.landing-card::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 3px;
	background: var( --card-accent-color );
	opacity: 0;
	transition: opacity 0.2s;
}
.landing-card:hover {
	box-shadow: var( --landing-shadow-card-hover );
	transform: translateY( -3px );
	border-color: transparent;
	color: inherit;
}
.landing-card:hover::before { opacity: 1; }
.landing-card:focus-visible {
	outline: 3px solid var( --landing-link-blue );
	outline-offset: 2px;
}
.landing-card--data      { --card-accent-color: #3366CC; --card-icon-bg: #EDF2FF; }
.landing-card--bots      { --card-accent-color: #1A6636; --card-icon-bg: #E9F7EE; }
.landing-card--oss       { --card-accent-color: #054C7C; --card-icon-bg: #EAF3FB; }
.landing-card--community { --card-accent-color: #7A4800; --card-icon-bg: #FFF4E6; }
.landing-card--help      { --card-accent-color: #8C1F1F; --card-icon-bg: #FEF2F2; }

.landing-card__icon {
	width: 52px;
	height: 52px;
	border-radius: var( --landing-radius-md );
	background: var( --card-icon-bg );
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 1.25rem;
	flex-shrink: 0;
}
.landing-card__tags {
	display: flex;
	gap: 6px;
	flex-wrap: wrap;
	margin-bottom: 1rem;
}
.landing-card__tag {
	font-size: 11px;
	font-family: var( --landing-font-display );
	font-weight: 600;
	letter-spacing: 0.05em;
	text-transform: uppercase;
	padding: 3px 10px;
	border-radius: 100px;
	background: var( --card-icon-bg );
	color: var( --landing-text-secondary );
}
.landing-card__title {
	font-family: var( --landing-font-display );
	font-size: 1.15rem;
	font-weight: 700;
	color: var( --landing-text-primary );
	margin-bottom: 0.6rem;
	letter-spacing: -0.01em;
	line-height: 1.2;
	margin-block-start: 0;
}
.landing-card__desc {
	font-size: 14px;
	color: var( --landing-text-secondary );
	line-height: 1.65;
	flex: 1;
	margin-bottom: 1.5rem;
	margin-block: 0 1.5rem;
}
.landing-card__links {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 6px;
	border-top: 1px solid var( --landing-border );
	padding-top: 1rem;
	margin-top: auto;
}
.landing-card__link {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 13px;
	font-family: var( --landing-font-display );
	font-weight: 500;
	color: var( --landing-link-blue );
}

.landing-community {
	background: var( --landing-deep-blue );
	padding: 4rem 2rem;
}
.landing-community__inner {
	max-width: 1200px;
	margin: 0 auto;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 2rem;
	flex-wrap: wrap;
}
.landing-community__text h2 {
	font-family: var( --landing-font-display );
	font-size: 1.6rem;
	font-weight: 700;
	color: white;
	margin-bottom: 0.5rem;
	letter-spacing: -0.01em;
	margin-block-start: 0;
}
.landing-community__text p {
	color: rgba( 255, 255, 255, 0.65 );
	font-size: 15px;
	max-width: 460px;
	line-height: 1.6;
	margin-block: 0;
}
.landing-community__channels {
	display: flex;
	gap: 12px;
	flex-wrap: wrap;
}
.landing-channel-btn {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	background: rgba( 255, 255, 255, 0.1 );
	border: 1px solid rgba( 255, 255, 255, 0.2 );
	color: white;
	font-family: var( --landing-font-display );
	font-size: 14px;
	font-weight: 500;
	padding: 10px 18px;
	border-radius: var( --landing-radius-md );
	text-decoration: none;
	transition: background 0.15s, border-color 0.15s;
}
.landing-channel-btn:hover {
	background: rgba( 255, 255, 255, 0.18 );
	border-color: rgba( 255, 255, 255, 0.35 );
	color: white;
}

.landing-footer {
	background: #0C1A24;
	padding: 3rem 2rem;
}
.landing-footer__inner {
	max-width: 1200px;
	margin: 0 auto;
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 1.5rem;
}
.landing-footer__brand {
	display: flex;
	align-items: center;
	gap: 10px;
	color: rgba( 255, 255, 255, 0.6 );
	font-size: 13px;
	font-family: var( --landing-font-display );
}
.landing-footer__brand img { opacity: 0.65; }
.landing-footer__links {
	display: flex;
	gap: 1.5rem;
	flex-wrap: wrap;
	list-style: none;
	padding: 0;
	margin: 0;
}
.landing-footer__links a {
	color: rgba( 255, 255, 255, 0.45 );
	font-size: 13px;
	text-decoration: none;
	font-family: var( --landing-font-display );
	transition: color 0.15s;
}
.landing-footer__links a:hover { color: rgba( 255, 255, 255, 0.8 ); }
.landing-footer__copy {
	width: 100%;
	color: rgba( 255, 255, 255, 0.25 );
	font-size: 12px;
	padding-top: 1.5rem;
	border-top: 1px solid rgba( 255, 255, 255, 0.06 );
	margin: 0;
}
.landing-footer__copy a { color: rgba( 255, 255, 255, 0.4 ); }

@media ( max-width: 1024px ) {
	.landing-pathways__row--2 {
		grid-template-columns: repeat( 2, 1fr );
		max-width: 100%;
	}
}
@media ( max-width: 900px ) {
	.landing-hero__inner { grid-template-columns: 1fr; gap: 3rem; }
	.landing-api__inner  { grid-template-columns: 1fr; gap: 3rem; }
	.landing-nav__links  { display: none; }
	.landing-pathways__row--3 { grid-template-columns: 1fr; }
	.landing-pathways__row--2 { grid-template-columns: 1fr; max-width: 100%; }
}
@media ( max-width: 640px ) {
	.landing-hero { padding: 3.5rem 1.25rem 0; }
	.landing-hero__stats   { gap: 1.5rem; }
	.landing-hero__actions { flex-direction: column; }
	.landing-community__inner { flex-direction: column; align-items: flex-start; }
}
@media ( prefers-reduced-motion: reduce ) {
	*, *::before, *::after {
		animation-duration: 0.001ms !important;
		transition-duration: 0.001ms !important;
	}
}
</style>
