Vue.component("pagination", {
    data() {
        return {};
    },
    /** 
     * Pagination 分頁模板
     * 用總頁數與當前頁數做判斷，動態綁定 class disabled 或 active
     */
    template: `<nav aria-label="Page navigation" class="mt-4">
            <ul class="pagination justify-content-end">
                <li class="page-item" :class="{'disabled': pages.current_page === 1}">
                    <a class="page-link" href="#" aria-label="Previous" @click.prevent="emitPages(pages.current_page - 1)">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
                <li class="page-item" v-for="(page, idx) in pages.total_pages" :key="idx" :class="{'active': page === pages.current_page}">
                    <a class="page-link" href="#" @click.prevent="emitPages(item)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{'disabled': pages.current_page === pages.total_pages}">
                    <a class="page-link" href="#" aria-label="Next" @click.prevent="emitPages(pages.current_page + 1)">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            </ul>
        </nav>`,
    props: {
        // 接受由外(products) 向內 (pagination) 傳遞的分頁物件，在 getProducts 取得的分頁物件
        pages: {},
    },
    methods: {
        emitPages(item) {
            // 透過 $emit 向外傳遞使用者點擊的分頁，並觸發外層的 getProducts 
            this.$emit('emit-pages', item);
        },
    }
});
