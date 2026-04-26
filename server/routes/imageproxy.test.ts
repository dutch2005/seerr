
import { expect, test } from "bun:test";

const tmdbRegex = /^(\/t\/p\/[\w-]{1,255}){1}(\/[\w-]{1,255})+\.(jpg|jpeg|png|webp|svg)$/;
const tvdbRegex = /^(\/[\w-]{1,255})+\.(jpg|jpeg|png|webp|svg)$/;

const testCases = [
  {
    type: 'tmdb',
    path: '/t/p/w600_and_h900_bestv2/path.jpg',
    expected: true,
  },
  {
    type: 'tmdb',
    path: '/t/p/w1920_and_h800_multi_faces/abc.jpg',
    expected: true,
  },
  {
    type: 'tmdb',
    path: '/t/p/original/abc-123.webp',
    expected: true,
  },
  {
    type: 'tmdb',
    path: '/t/p/w500/image.png',
    expected: true,
  },
  {
    type: 'tmdb',
    path: '//evil.com/malicious',
    expected: false,
  },
  {
    type: 'tmdb',
    path: '/t/p/w500/../../../etc/passwd',
    expected: false,
  },
  {
    type: 'tmdb',
    path: '/t/p/w500/image.php',
    expected: false,
  },
  {
    type: 'tmdb',
    path: 'https://evil.com/image.jpg',
    expected: false,
  },
  {
    type: 'tmdb',
    path: '/t/p/w500/abc/def/ghi.jpg',
    expected: true,
  },
  {
    type: 'tvdb',
    path: '/banners/posters/5c8f116129983.jpg',
    expected: true,
  },
  {
    type: 'tvdb',
    path: '/banners/fanart/12345.png',
    expected: true,
  },
  {
    type: 'tvdb',
    path: '/sub/folder/image.webp',
    expected: true,
  },
  {
    type: 'tvdb',
    path: '/too/many/folders/level/four/image.jpg',
    expected: true,
  },
  {
    type: 'tvdb',
    path: '/short.jpg',
    expected: true,
  },
  {
    type: 'tvdb',
    path: '/banners/posters/../../etc/passwd',
    expected: false,
  },
  {
    type: 'tvdb',
    path: '/banners/posters/evil.com/image.jpg',
    expected: false,
  },
   {
    type: 'tvdb',
    path: '/banners/posters/image.jpg?evil=true',
    expected: false,
  },
];

testCases.forEach((tc) => {
  test(`${tc.type} - ${tc.path}`, () => {
    let result;
    if (tc.type === 'tmdb') {
       result = tmdbRegex.test(tc.path);
    } else {
       result = tvdbRegex.test(tc.path);
    }
    expect(result).toBe(tc.expected);
  });
});
