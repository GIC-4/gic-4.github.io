<script lang="ts">
	import { GithubSolid } from 'flowbite-svelte-icons';
</script>

<div class="github-link-container">
	<div class="github-triangle">
		<a
			class="github-link"
			href="https://github.com/GIC-4/gic-4.github.io"
			target="_blank"
			rel="noopener noreferrer"
			aria-label="GitHub"
		>
			<div class="github-icon-wrapper">
				<GithubSolid size="xl" class="github-icon" />
			</div>
		</a>
	</div>
</div>

<style>
	.github-link-container {
		position: fixed;
		top: 0;
		right: 0;
		width: 80px;
		height: 80px;
		z-index: 1000;
	}
	.github-triangle {
		width: 100%;
		height: 100%;
		background: transparent;
		clip-path: polygon(100% 0, 0 0, 100% 100%);
		background: #fff;
		display: flex;
		align-items: flex-start;
		justify-content: flex-end;
	}
	.github-icon-wrapper {
		margin: 12px 8px 0 0;
		display: inline-block;
		transform: rotate(45deg);
	}
</style>
