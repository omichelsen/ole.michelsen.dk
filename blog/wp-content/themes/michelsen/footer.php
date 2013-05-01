<?php
/**
 * The template for displaying the footer.
 *
 * Contains the closing of the id=main div and all content
 * after.  Calls sidebar-footer.php for bottom widgets.
 *
 * @package WordPress
 * @subpackage Michelsen
 * @since Michelsen 1.0
 */
?>
	</div><!-- #main -->

	<footer id="footer" role="contentinfo">
		<section>
			<p id="colophon">Created by <a href="mailto:<?php bloginfo( 'admin_email' ); ?>"><?php bloginfo( 'name' ); ?></a></p>
			<?php if ( function_exists('yoast_breadcrumb') ) {
				yoast_breadcrumb('<p id="sitemappath">','</p>');
			} ?>
<?php
	/* A sidebar in the footer? Yep. You can can customize
	 * your footer with four columns of widgets.
	 */
	get_sidebar( 'footer' );
?>
		</section>
	</footer>

</div><!-- #wrapper -->

<?php
	/* Always have wp_footer() just before the closing </body>
	 * tag of your theme, or you will break many plugins, which
	 * generally use this hook to reference JavaScript files.
	 */

	wp_footer();
?>
</body>
</html>
