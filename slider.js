const clientCarousel = document.querySelector('.sliders');

class Carousel {
    constructor(parentDiv, setting) {
        this.parentDiv = parentDiv;
        this.setting = Object.assign({}, {
            slidesVisible: 1,
            moveAmount: 1,
            dotts: true,
            contentAnimation: true,
            responsive: [
                { breakPoint: 500, slidesVisible: 1, moveAmount: 1 },
                { breakPoint: 800, slidesVisible: 2, moveAmount: 1 },
                { breakPoint: 1000, slidesVisible: 3, moveAmount: 1 },
            ]
        }, setting);
        this.current = 0;
        this.mylist = this.createElements("ul", "carousel__dotts");
        this.mydotts = [];
        this.build();
        this.size = 100 / this.carousel__items.length;
        this.drag_drop();
    }
    build() {
        this.carousel = this.createElements('div', 'carousel');
        this.container = this.createElements('div', 'carousel__container');
        this.carousel.append(this.container);
        this.carousel__items = [...this.parentDiv.children].map(slider => {
            let item = this.createElements('div', 'carousel__child');
            item.append(slider);
            this.container.append(item);
            return item
        });
        this.parentDiv.append(this.carousel);
        this.setWidths();
        if (this.setting.arrow) {
            this.buttons();
        }
        if (this.setting.dotts) {
            this.dotts();
            this.dottActive(0);
        }
        window.addEventListener('resize', this.onResize.bind(this));
        this.toggleClass(0);
    }
    onResize() {
        this.setWidths()
        if (this.setting.dotts) {
            this.dotts();
            this.dottActive(0);
        }
        this.move(this.current);
    }
    getSetting() {
        let res = this.setting.responsive.sort((a, b) => a.breakPoint - b.breakPoint).find((point) => window.innerWidth <= point.breakPoint)
        return res ? res : this.setting;
    }


    createElements(element, clas) {
        let a = document.createElement(element);
        a.setAttribute('class', clas);
        return a;
    }
    setWidths() {
        this.container.style.width = `${(this.carousel__items.length / this.getSetting().slidesVisible) * 100}%`;
        for (let e of this.carousel__items) {
            e.style.width = `${100 / this.carousel__items.length}%`
        }
    }
    buttons() {
        this.leftButton = this.createElements('button', 'carousel__btn carousel__btn--prev');
        this.leftButton.innerHTML = `<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g mirror-in-rtl="" >
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
      </g></svg>`;
        this.leftButton.setAttribute('aria-pressed', 'false');
        this.RightButton = this.createElements('button', 'carousel__btn carousel__btn--next');
        this.RightButton.innerHTML = `<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g mirror-in-rtl="" >
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
      </g></svg>`;
        this.RightButton.setAttribute('aria-pressed', 'false');
        let carouselControls = this.createElements('div', 'carousel__controls')
        carouselControls.append(this.leftButton);
        carouselControls.append(this.RightButton);
        this.parentDiv.append(carouselControls);
        this.leftButton.addEventListener('click', this.prevSlid.bind(this));
        this.RightButton.addEventListener('click', this.nextSlid.bind(this));
    }
    nextSlid() {
        this.move(this.current + this.getSetting().moveAmount, this.setting.arrowTran);
    }
    prevSlid() {
        this.move(this.current - this.getSetting().moveAmount, this.setting.arrowTran);
    }
    move(index, trans) {
        if (index < 0) {
            if (this.current == 0) {
                this.container.style.transition = '1s';
                index = (this.carousel__items.length - this.getSetting().slidesVisible);
            } else {
                this.container.style.transition = '1s';
                index = 0;
            }
        }
        else if (index > this.carousel__items.length - this.getSetting().slidesVisible && this.current >= this.carousel__items.length - this.getSetting().slidesVisible) {
            this.container.style.transition = '1s';
            index = 0;
        }
        index = this.transX(this.size * index) || index;
        this.container.style.transition = '1s';
        if (!trans) {
            this.container.style.transition = '1s';
        }
        this.container.style.transform = `translateX(${-this.size * index}%)`;
        setTimeout(() => {
            this.container.style.transition = '';
        })
        this.current = index;
        if (this.setting.dotts) this.dottActive(index);
        this.toggleClass(index);
    }
    transX(x) {
        if (x >= (this.container.clientWidth - this.carousel.clientWidth) * 100 / this.container.clientWidth) {
            return this.carousel__items.length - this.getSetting().slidesVisible;
        }
        return null;
    }
    dotts() {
        this.mylist.innerHTML = "";
        let x = Math.ceil((this.carousel__items.length - this.getSetting().slidesVisible) / this.getSetting().moveAmount);
        for (let i = 0; i <= x; i++) {
            let myli = this.createElements("li", "carousel__list");
            this.mylist.append(myli);
            myli.addEventListener("click", () => {
                this.move(i * this.getSetting().moveAmount, this.setting.arrowTran);
            });
        }
        this.parentDiv.append(this.mylist);
        this.mydotts = [...this.mylist.children];
    }
    dottActive(index) {
        let active_dot = this.mydotts[Math.ceil(index / this.getSetting().moveAmount)]
        this.mydotts.forEach(i => i.classList.remove("carousel__list--active"));
        active_dot.classList.add("carousel__list--active");
    }
    toggleClass(index) {

        try {
            if (!this.setting.contentAnimation || this.getSetting().slidesVisible > 1 || this.scrolAnim) {
                return;
            }
            this.carousel__items.forEach(item => { item.classList.remove('active'); });
            this.carousel__items.forEach(item => item.querySelector('.container').classList.remove('active'));
            for (let i = index; i < this.getSetting().slidesVisible + index; i++) {
                this.carousel__items[i].classList.add('active');
                this.carousel__items[i].querySelector('.container').classList.add('active');
            }
        } catch (er) {
            return;
        }

    }
    drag_drop() {
        this.container.addEventListener("mousedown", this.onstart.bind(this))

        window.addEventListener("mousemove", this.onmove.bind(this))

        window.addEventListener("mouseup", this.onend.bind(this))

        this.container.addEventListener("touchstart", this.onstart.bind(this))

        window.addEventListener("touchmove", this.onmove.bind(this))

        window.addEventListener("touchend", this.onend.bind(this))
        this.container.addEventListener("dragstart", e => e.preventDefault())
    }
    onstart(e) {
        if (e.touches) {
            if (e.touches.length > 1) return;
            e = e.touches[0];
        }
        this.startx = e.screenX;
    }
    onmove(e) {
        if (this.startx) {
            let tranEnd = -(this.current * 100 / this.carousel__items.length) + (this.a * 100 / this.container.clientWidth);
            if (this.getSetting().slidesVisible === this.carousel__items.length) return;
            this.scrolAnim = true;
            this.toggleClass(this.current);
            let event = e.touches ? e.touches[0] : e;
            this.a = event.screenX - this.startx;
            this.container.style.transition = "none";
            if (tranEnd >= 10) tranEnd = 10;
            else if (tranEnd <= -(this.carousel__items.length - this.getSetting().slidesVisible) * this.size - 10) tranEnd = -(this.carousel__items.length - this.getSetting().slidesVisible) * this.size - 10;
            this.container.style.transform = `translateX(${tranEnd}%)`;
        }
    }
    onend() {
        if (this.startx) {
            setTimeout(() => { this.container.style.transition = "1s"; });
            this.scrolAnim = false;
            this.toggleClass(this.current);
            if (Math.abs(this.a) * 100 / this.carousel.clientWidth > 10) {
                if (this.a > 0) {
                    if ((-this.current * 100 / this.carousel__items.length + this.a * 100 / this.container.clientWidth) >= 0) {
                        this.move(0);
                    }
                    else {
                        this.move(Math.floor(Math.abs(-this.current * 100 / this.carousel__items.length + this.a * 100 / this.container.clientWidth) / (100 / this.carousel__items.length)), this.getSetting().slidesVisible != 1);
                    }
                }
                else {
                    if (this.current == this.carousel__items.length - this.getSetting().slidesVisible) {
                        this.move(this.current);

                    } else {
                        this.move(Math.ceil(Math.abs(-this.current * 100 / this.carousel__items.length + this.a * 100 / this.container.clientWidth) / (100 / this.carousel__items.length)), this.getSetting().slidesVisible != 1);
                    }
                }
            }
            else {
                this.move(this.current, this.getSetting().slidesVisible !== 1);
            }
            this.a = null;
            this.startx = null;
        }
    }
}

//0)-how to initiate the carousel
//1)-clientCarousel
//2)-select number of slides
//3)-move amount
//4)-arrow left and right
//5)-dotts to click
//6)-arrow transition if true slide will animate
new Carousel(clientCarousel, {
    slidesVisible: 1,
    moveAmount: 1,
    arrow: true,
    dotts: false,
    arrowTran: true
});