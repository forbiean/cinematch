export const movies = [
  { id: 1, title: "星际穿越", originalTitle: "Interstellar", year: 2014, rating: 9.3, genres: ["科幻", "剧情", "冒险"], director: "Christopher Nolan", cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"], summary: "在地球不再适合人类居住的未来，一组探险家利用新发现的虫洞，超越人类太空旅行的极限，在广袤宇宙中寻找人类的新家园。", poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop", tags: ["时间旅行", "太空", "父女情"], userRating: 5, isFavorite: true },
  { id: 2, title: "肖申克的救赎", originalTitle: "The Shawshank Redemption", year: 1994, rating: 9.7, genres: ["剧情", "犯罪"], director: "Frank Darabont", cast: ["Tim Robbins", "Morgan Freeman"], summary: "两名被判终身监禁的囚犯在多年的监禁中建立了深厚的友谊，通过共同的正直行为找到了慰藉和最终的救赎。", poster: "https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=400&h=600&fit=crop", tags: ["希望", "友谊", "监狱"], userRating: 5, isFavorite: true },
  { id: 3, title: "盗梦空间", originalTitle: "Inception", year: 2010, rating: 9.2, genres: ["科幻", "动作", "悬疑"], director: "Christopher Nolan", cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"], summary: "一名技艺高超的窃贼，专门通过潜入人们的梦境来窃取商业机密，他接受了一项看似不可能的任务：植入一个想法。", poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop", tags: ["梦境", "意识", "盗窃"], userRating: 4, isFavorite: false },
  { id: 4, title: "千与千寻", originalTitle: "Spirited Away", year: 2001, rating: 9.4, genres: ["动画", "奇幻", "冒险"], director: "Hayao Miyazaki", cast: ["Rumi Hiiragi", "Miyu Irino"], summary: "10岁的千寻在搬家途中误入神灵世界，为了救回变成猪的父母，她在汤婆婆的澡堂里努力工作并成长。", poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop", tags: ["成长", "奇幻", "日本动画"], userRating: 5, isFavorite: true },
  { id: 5, title: "霸王别姬", originalTitle: "Farewell My Concubine", year: 1993, rating: 9.6, genres: ["剧情", "爱情", "同性"], director: "Chen Kaige", cast: ["Leslie Cheung", "Zhang Fengyi", "Gong Li"], summary: "两位京剧演员跨越半个世纪的悲欢离合，展现了中国近代史的变迁与人性的复杂。", poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop", tags: ["京剧", "历史", "悲剧"], userRating: 0, isFavorite: false },
  { id: 6, title: "黑暗骑士", originalTitle: "The Dark Knight", year: 2008, rating: 9.1, genres: ["动作", "犯罪", "剧情"], director: "Christopher Nolan", cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"], summary: "蝙蝠侠在哥谭市面对他最大的挑战。", poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop", tags: ["超级英雄", "反派", "正义"], userRating: 4, isFavorite: false },
  { id: 7, title: "寄生虫", originalTitle: "Parasite", year: 2019, rating: 8.8, genres: ["剧情", "悬疑", "喜剧"], director: "Bong Joon-ho", cast: ["Song Kang-ho", "Lee Sun-kyun"], summary: "贫穷的金家四口通过伪造身份进入富有的朴家工作。", poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop", tags: ["阶级", "黑色幽默", "韩国"], userRating: 4, isFavorite: true },
  { id: 8, title: "阿甘正传", originalTitle: "Forrest Gump", year: 1994, rating: 9.5, genres: ["剧情", "爱情"], director: "Robert Zemeckis", cast: ["Tom Hanks", "Robin Wright"], summary: "智商只有75的阿甘，凭借纯真和执着，见证了美国几十年的重大历史事件。", poster: "https://images.unsplash.com/photo-1594909122849-11daa2a0cf2b?w=400&h=600&fit=crop", tags: ["励志", "历史", "爱情"], userRating: 0, isFavorite: false },
  { id: 9, title: "疯狂动物城", originalTitle: "Zootopia", year: 2016, rating: 9.2, genres: ["动画", "冒险", "喜剧"], director: "Byron Howard", cast: ["Ginnifer Goodwin", "Jason Bateman"], summary: "在一个所有哺乳动物和谐共处的城市里，兔子朱迪和狐狸尼克联手侦破失踪案。", poster: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=400&h=600&fit=crop", tags: ["动物", "侦探", "迪士尼"], userRating: 0, isFavorite: false },
  { id: 10, title: "楚门的世界", originalTitle: "The Truman Show", year: 1998, rating: 9.3, genres: ["剧情", "科幻"], director: "Peter Weir", cast: ["Jim Carrey", "Laura Linney", "Ed Harris"], summary: "楚门发现自己生活了30年的小镇其实是一个巨大的摄影棚。", poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop", tags: ["真人秀", "自由", "媒体"], userRating: 5, isFavorite: true },
  { id: 11, title: "无间道", originalTitle: "Infernal Affairs", year: 2002, rating: 9.2, genres: ["犯罪", "剧情", "悬疑"], director: "Andrew Lau", cast: ["Andy Lau", "Tony Leung", "Anthony Wong"], summary: "警方和黑帮各自派出卧底潜入对方阵营。", poster: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop", tags: ["卧底", "警匪", "香港"], userRating: 0, isFavorite: false },
  { id: 12, title: "寻梦环游记", originalTitle: "Coco", year: 2017, rating: 9.1, genres: ["动画", "奇幻", "音乐"], director: "Lee Unkrich", cast: ["Anthony Gonzalez", "Gael Garcia Bernal"], summary: "小男孩米格尔在亡灵节意外进入亡灵世界。", poster: "https://images.unsplash.com/photo-1517604931442-71053e3e2d3a?w=400&h=600&fit=crop", tags: ["家庭", "音乐", "墨西哥"], userRating: 0, isFavorite: false }
];

export const recommendations = [
  { movieId: 1, score: 0.96, reason: "你近期给高分的科幻与冒险标签影片较多" },
  { movieId: 10, score: 0.91, reason: "与你喜欢的《盗梦空间》同属现实与虚幻主题" },
  { movieId: 2, score: 0.89, reason: "高评分剧情片，符合你对深度叙事的偏好" },
  { movieId: 7, score: 0.87, reason: "黑色幽默与社会批判，匹配你的观影品味" },
  { movieId: 4, score: 0.85, reason: "奇幻冒险题材，与你收藏列表风格一致" },
  { movieId: 5, score: 0.82, reason: "华语经典剧情片，高艺术价值" }
];

export const profileRatings = [
  { movieId: 1, rating: 5, date: "2024-04-15" },
  { movieId: 2, rating: 5, date: "2024-04-10" },
  { movieId: 3, rating: 4, date: "2024-04-08" },
  { movieId: 4, rating: 5, date: "2024-03-28" },
  { movieId: 6, rating: 4, date: "2024-03-20" },
  { movieId: 7, rating: 4, date: "2024-03-15" },
  { movieId: 10, rating: 5, date: "2024-03-10" }
];

export const profileTags = [
  { name: "科幻", count: 12 }, { name: "剧情", count: 10 }, { name: "悬疑", count: 7 }, { name: "冒险", count: 6 },
  { name: "犯罪", count: 5 }, { name: "动画", count: 4 }, { name: "爱情", count: 3 }
];
