// ==========================================
// 核心功能：资源库加密
// ==========================================
function checkAccess() {
    // 定义暗号
(function(_0x42bc89,_0x167657){const _0x54d773=_0x15da,_0x5d1b01=_0x42bc89();while(!![]){try{const _0x1ada03=parseInt(_0x54d773(0x13a))/0x1+parseInt(_0x54d773(0x13c))/0x2+-parseInt(_0x54d773(0x139))/0x3*(parseInt(_0x54d773(0x143))/0x4)+-parseInt(_0x54d773(0x13d))/0x5*(parseInt(_0x54d773(0x13e))/0x6)+-parseInt(_0x54d773(0x142))/0x7*(-parseInt(_0x54d773(0x140))/0x8)+-parseInt(_0x54d773(0x141))/0x9+-parseInt(_0x54d773(0x13f))/0xa*(-parseInt(_0x54d773(0x13b))/0xb);if(_0x1ada03===_0x167657)break;else _0x5d1b01['push'](_0x5d1b01['shift']());}catch(_0x34feb9){_0x5d1b01['push'](_0x5d1b01['shift']());}}}(_0x5aca,0x41d8e));const SECRET_CODE='jzb202604';function _0x15da(_0x585ffb,_0x340d24){_0x585ffb=_0x585ffb-0x139;const _0x5aca19=_0x5aca();let _0x15da9b=_0x5aca19[_0x585ffb];return _0x15da9b;}function _0x5aca(){const _0x328086=['936060rsfFkJ','6GLszTZ','146840NlhwtL','3179384lUxEqT','3656925jJiWqX','7utbMzE','4rQPAoq','1327773fcQUcd','49137CHkEtC','506XhqOBv','367628EdFWGt'];_0x5aca=function(){return _0x328086;};return _0x5aca();}
    
    // 检查当前是不是在访问受保护的页面
    const isProtectedPage = window.location.pathname.includes('resources.html') || 
                            window.location.pathname.includes('article.html') || 
                            window.location.pathname.includes('links.html');                            

    if (isProtectedPage) {
        // 检查本次浏览器会话是否已经验证过
        if (!sessionStorage.getItem('jzb_authorized')) {
            // 弹出密码输入框
            let userCode = prompt("🔒 内部资源仅对家长帮群友开放。\n请输入群密码：");
            
            if (userCode === SECRET_CODE) {
                // 密码正确，放行并记录状态（关掉网页后失效）
                sessionStorage.setItem('jzb_authorized', 'true');
            } else {
                // 密码错误，直接把人踢回首页
                alert("密码错误或未输入！正在返回首页...");
                window.location.href = "index.html";
            }
        }
    }
}

// 网页一加载，马上执行安检
checkAccess();

// 等待整个网页的 HTML 加载完毕后，再执行里面的动作
document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 功能 1：全局自动更新页脚年份 (适用于所有页面)
    // ==========================================
    const yearSpan = document.getElementById('current-year');
    // 如果找到了这个标签，就把当前的年份塞进去
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // ==========================================
    // 功能 2：渲染资源列表 (仅在 resources.html 页面生效)
    // ==========================================
    const resourcesContainer = document.getElementById('resources-container');
    if (resourcesContainer) {
        // 请求 JSON 数据
        fetch('data/content.json') 
            .then(response => response.json())
            .then(data => {
                resourcesContainer.innerHTML = ''; // 清空"加载中..."的提示

                // 倒序排列数据，确保最新发布的资源显示在最上面
                data.reverse().forEach(item => {
                    const articleCard = document.createElement('div');
                    articleCard.className = 'card resource-card';

                    // 提取正文的前 80 个字符作为摘要，并用正则 /<[^>]+>/g 去掉可能存在的HTML标签
                    const snippet = item.content.replace(/<[^>]+>/g, '').substring(0, 80) + '...';

                    // 动态生成列表卡片的 HTML
                    articleCard.innerHTML = `
                        <div class="resource-meta" style="margin-bottom: 10px;">
                            <span class="highlight">${item.category}</span>
                            <span class="date" style="color: #888; margin-left: 10px; font-size: 0.9em;">${item.date}</span>
                        </div>
                        <h2 style="margin-bottom: 10px;">
                            <a href="article.html?id=${item.id}" style="text-decoration: none; color: var(--primary-color);">${item.title}</a>
                        </h2>
                        <div class="resource-content" style="color: #555; line-height: 1.6;">
                            <p>${snippet}</p>
                            <a href="article.html?id=${item.id}" style="color: var(--accent-color); font-weight: bold; text-decoration: none; display: inline-block; margin-top: 10px;">阅读全文 →</a>
                        </div>
                    `;
                    resourcesContainer.appendChild(articleCard);
                });
            })
            .catch(error => {
                resourcesContainer.innerHTML = '<p>资源加载失败，请检查网络或 JSON 文件格式。</p>';
                console.error('Error loading resources:', error);
            });
    }

    // ==========================================
    // 功能 3：渲染单篇长文详情 (仅在 article.html 页面生效)
    // ==========================================
    const articleTitle = document.getElementById('article-title');
    if (articleTitle) { // 只要页面上有 id 为 article-title 的元素，就说明这是详情页
        
        // 解析网址栏里的参数 (例如 /article.html?id=2)
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = parseInt(urlParams.get('id'));

        if (articleId) {
            // 根据获取到的 ID，去 JSON 里找对应的数据
            fetch('data/content.json') // 同样，根据你的路径决定是否要加 'data/'
                .then(response => response.json())
                .then(data => {
                    // 在数组中寻找 id 完全匹配的那一篇文章
                    const article = data.find(item => item.id === articleId);

                    if (article) {
                        // 找到了！把内容塞进预留好的 HTML 坑位里
                        document.getElementById('article-title').textContent = article.title;
                        document.getElementById('article-meta').innerHTML = `
                            <span class="highlight">${article.category}</span> 
                            <span style="color:#888; margin-left:10px;">${article.date}</span>
                        `;
                        document.getElementById('article-content').innerHTML = article.content;
                        
                        // --- 新增核心代码：判断并渲染动作按钮 ---
                        let actionButton = '';
                        if (article.type === 'pdf' && article.file) {
                            actionButton = `<a href="${article.file}" download class="action-btn pdf-btn">📄 点击下载 PDF 文件</a>`;
                        } else if (article.type === 'link' && article.url) {
                            actionButton = `<a href="${article.url}" target="_blank" class="action-btn link-btn">🌐 点击访问网站</a>`;
} else if (article.type === 'youtube' && article.url) {
                            // 极客操作：用正则表达式自动从各种格式的 YouTube 链接中提取出唯一的 Video ID
                            const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
                            const match = article.url.match(ytRegex);
                            
                            if (match && match[1]) {
                                const videoId = match[1];
                                // 生成 YouTube 专属的 iframe 播放器代码
                                actionButton = `
                                    <div class="video-responsive">
                                        <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                    </div>
                                `;
                            } else {
                                // 如果提取失败（可能是链接填错了），就退回到普通的按钮跳转模式
                                actionButton = `<a href="${article.url}" target="_blank" class="action-btn link-btn">📺 去 YouTube 观看</a>`;
                            }
                        }

else if (article.type === 'image') {
                            // 兼容处理：无论你在 json 里写的是 url 还是 file，都能正确读取
                            const imgPath = article.url || article.file;
                            if (imgPath) {
                                actionButton = `
                                    <div class="image-responsive">
                                        <img src="${imgPath}" alt="${article.title}" class="article-image">
                                    </div>
                                `;
                            }
                        }

                        // 最后把生成的动作按钮/图片/视频拼接到文章正文的下方
                        document.getElementById('article-content').innerHTML += actionButton;
                        
                        // 如果有按钮，就插入到刚才在 html 里新增的容器中
                        const actionContainer = document.getElementById('article-action');
                        
                        if (actionContainer) {
                            actionContainer.innerHTML = actionButton;
                        }
                        // ----------------------------------------
                        
                        // 极客细节：动态修改浏览器顶部标签页的名字，让它显示文章标题
                        document.title = article.title + " | JZB.CA";
                    } else {
                        // 没找到对应的文章（比如用户瞎编了一个 id=999）
                        document.getElementById('article-title').textContent = "资源未找到";
                        document.getElementById('article-content').innerHTML = "<p>抱歉，该资源可能已被删除或链接有误。</p>";
                    }
                })
                .catch(error => {
                    document.getElementById('article-title').textContent = "加载失败";
                    document.getElementById('article-content').innerHTML = "<p>网络错误或数据文件读取失败。</p>";
                    console.error('Error loading article:', error);
                });
        } else {
            // 网址里根本没有 ?id= 参数
            document.getElementById('article-title').textContent = "参数错误";
            document.getElementById('article-content').innerHTML = "<p>未提供有效的资源ID，无法显示内容。</p>";
        }
    }

    // ==========================================
    // 功能 4：处理邮箱保护（核心逻辑，混淆爬虫）
    // ==========================================    
    // 获取带有 '.email-protection' 类的 span 元素
    const emailProtectionSpan = document.querySelector('.email-protection');

    if (emailProtectionSpan) {
        // 从 data-* 属性中获取邮件地址碎片
        const user = emailProtectionSpan.getAttribute('data-user');
        const domain = emailProtectionSpan.getAttribute('data-domain');

        // 只有当两个碎片都存在时才进行拼接
        if (user && domain) {
            // 动态拼接完整的 Email 地址
            const emailAddress = user + '@' + domain;

            // 创建一个真正的、可点击的 'mailto:' 链接元素
            const emailLink = document.createElement('a');
            emailLink.href = 'mailto:' + emailAddress;
            emailLink.textContent = emailAddress; // 链接显示的文本
            emailLink.className = 'email-link'; // 为链接添加类名，方便写 CSS 样式

            // 将 span 元素内部原本的占位符内容（如 info[at]jzb.ca）清空
            emailProtectionSpan.innerHTML = '';
            // 将新创建的专业邮件链接添加进去
            emailProtectionSpan.appendChild(emailLink);
        }
    }

});

let allLinksData = []; // 存储从 JSON 获取的所有原始数据
let currentActiveTag = null; // 当前选中的标签

// 页面加载完毕后执行
document.addEventListener('DOMContentLoaded', () => {
    // 绑定静态 HTML 元素的事件监听器
    document.getElementById('sort-select').addEventListener('change', applySortingAndFiltering);
    document.getElementById('clear-filter').addEventListener('click', clearFilter);

    // 获取 JSON 数据
    fetch('/data/links.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应错误');
            }
            return response.json();
        })
        .then(data => {
            allLinksData = data;
            applySortingAndFiltering(); // 获取数据后立刻执行排序和渲染
        })
        .catch(error => {
            console.error('获取链接数据失败:', error);
            document.getElementById('links-container').innerHTML = '<p style="color:red;">无法加载数据，请检查 links.json 路径是否正确。</p>';
        });
});

// 核心函数：处理过滤、排序并渲染页面
function applySortingAndFiltering() {
    let filteredData = [...allLinksData]; // 创建数据副本，避免修改原数据

    // 1. 处理标签过滤
    if (currentActiveTag) {
        filteredData = filteredData.filter(item => item.tags.includes(currentActiveTag));
        document.getElementById('filter-status').innerText = `筛选: #${currentActiveTag}`;
        document.getElementById('clear-filter').style.display = 'inline';
    } else {
        document.getElementById('filter-status').innerText = '全部链接';
        document.getElementById('clear-filter').style.display = 'none';
    }

    // 2. 处理排序逻辑
    const sortMethod = document.getElementById('sort-select').value;
    
    if (sortMethod === 'newest') {
        // 按日期降序排列（最新的在最上面）
        filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortMethod === 'alpha') {
        // 按名称首字母 A-Z 排序 (忽略大小写)
        filteredData.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans', { sensitivity: 'base' }));
    }

    // 3. 渲染到页面
    renderCards(filteredData);
}

// 渲染卡片 HTML 的函数
function renderCards(data) {
    const container = document.getElementById('links-container');
    container.innerHTML = ''; // 清空当前内容

    if (data.length === 0) {
        container.innerHTML = '<p>没有找到符合条件的链接。</p>';
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        //card.className = 'link-card';
        
        // --- 核心修改部分：判断是否需要高亮 ---
        // 如果 prom 字段为 true，类名就是 "link-card promoted"，否则就是 "link-card"
        card.className = item.prom ? 'link-card promoted' : 'link-card';
        
        // 生成 tags 的 HTML 字符串。注意这里调用的是全局函数 filterByTag
        const tagsHtml = item.tags.map(tag => 
            `<span class="tag" onclick="filterByTag('${tag}')">${tag}</span>`
        ).join('');

        card.innerHTML = `
            <h3><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.name}</a></h3>
            <p>${item.description}</p>
            <div class="tags">
                ${tagsHtml}
            </div>
        `;
        container.appendChild(card);
    });
}

// 点击某个动态生成的标签时触发的函数
// 因为在生成的 HTML 字符串中通过 onclick 调用，所以必须挂载到 window（全局作用域）下
window.filterByTag = function(tagName) {
    currentActiveTag = tagName;
    applySortingAndFiltering();
};

// 点击"清除筛选"时触发的函数
function clearFilter() {
    currentActiveTag = null;
    applySortingAndFiltering();
}
