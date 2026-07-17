import assert from 'node:assert/strict'
import test from 'node:test'
import {
	contentLocaleFromPath,
	getMainNavigationIdFromPath,
	stripContentLocalePrefix
} from '../app/utils/contentRoute.ts'
import { normalizeSidebarFrontmatter } from '../app/composables/useContentPageSidebar.ts'

// After moving "Get Started" off the root, the front page maps to no menu id
// (→ no sidebar), while /get-started resolves to the get-started menu.
test( 'front page maps to no section-nav id', () => {
	assert.equal( getMainNavigationIdFromPath( '/' ), null )
	assert.equal( getMainNavigationIdFromPath( '/fr' ), null )
	assert.equal( getMainNavigationIdFromPath( '/es' ), null )
} )

test( 'get-started resolves at its new path (and localized)', () => {
	assert.equal( getMainNavigationIdFromPath( '/get-started' ), 'get-started' )
	assert.equal( getMainNavigationIdFromPath( '/fr/get-started' ), 'get-started' )
} )

test( 'other sections still resolve by path', () => {
	assert.equal( getMainNavigationIdFromPath( '/community' ), 'community' )
	assert.equal( getMainNavigationIdFromPath( '/community/anything' ), 'community' )
	assert.equal( getMainNavigationIdFromPath( '/use-content-and-data' ), 'use-content-and-data' )
	assert.equal( getMainNavigationIdFromPath( '/fr/community' ), 'community' )
} )

test( 'explorer routes never map to a content section id', () => {
	assert.equal( getMainNavigationIdFromPath( '/explorer' ), null )
} )

test( 'contentLocaleFromPath mirrors prefix_except_default', () => {
	assert.equal( contentLocaleFromPath( '/' ), 'en' )
	assert.equal( contentLocaleFromPath( '/get-started' ), 'en' )
	assert.equal( contentLocaleFromPath( '/fr' ), 'fr' )
	assert.equal( contentLocaleFromPath( '/fr/' ), 'fr' )
	assert.equal( contentLocaleFromPath( '/fr/get-started' ), 'fr' )
	assert.equal( contentLocaleFromPath( '/he/community' ), 'he' )
	// A slug that merely starts with a locale-like segment is not a locale prefix.
	assert.equal( contentLocaleFromPath( '/french-guide' ), 'en' )
} )

test( 'normalizeSidebarFrontmatter coerces the union TEXT column values', () => {
	// Nuxt Content stores the boolean|string union as TEXT and returns booleans
	// as strings (observed: index pages come back as the string "false").
	assert.equal( normalizeSidebarFrontmatter( 'false' ), false )
	assert.equal( normalizeSidebarFrontmatter( 'true' ), true )
	// Also accept genuine booleans, in case a boolean column path is used.
	assert.equal( normalizeSidebarFrontmatter( false ), false )
	assert.equal( normalizeSidebarFrontmatter( true ), true )
	// Menu-id strings pass through unchanged.
	assert.equal( normalizeSidebarFrontmatter( 'get-started' ), 'get-started' )
	// Absent / empty → undefined (automatic path-based resolution).
	assert.equal( normalizeSidebarFrontmatter( undefined ), undefined )
	assert.equal( normalizeSidebarFrontmatter( null ), undefined )
	assert.equal( normalizeSidebarFrontmatter( '' ), undefined )
} )

test( 'stripContentLocalePrefix yields the slug the middleware queries', () => {
	assert.equal( stripContentLocalePrefix( '/' ), '/' )
	assert.equal( stripContentLocalePrefix( '/fr' ), '/' )
	assert.equal( stripContentLocalePrefix( '/fr/get-started' ), '/get-started' )
	assert.equal( stripContentLocalePrefix( '/get-started' ), '/get-started' )
} )
