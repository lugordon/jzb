// ==========================================
// 核心功能：资源库加密
// ==========================================
function checkAccess() {
    // 定义暗号
    const SECRET_CODE = "jzb202604"; 
    
    // 检查当前是不是在访问受保护的页面
    const isProtectedPage = window.location.pathname.includes('resources.html') || 
                            window.location.pathname.includes('article.html');

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