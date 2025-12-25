(function(){
  'use strict';
  function readCart(){ try{ return JSON.parse(localStorage.getItem('cart')||'[]'); }catch(e){ return []; } }
  function writeCart(cart){ localStorage.setItem('cart', JSON.stringify(cart)); }

  function addToCart(item){
    const cart = readCart();
    // find existing by id
    const idx = cart.findIndex(it => it.id === item.id);
    if(idx >= 0){
      cart[idx].qty = (Number(cart[idx].qty)||0) + (Number(item.qty)||1);
    } else {
      cart.push({ id: item.id, name: item.name, price: Number(item.price)||0, qty: Number(item.qty)||1 });
    }
    writeCart(cart);
    updateCartCount();
  }

  function handleClick(e){
    const btn = e.currentTarget;
    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price)||0;
    // find qty input in same product/actions container
    let qty = 1;
    const actions = btn.closest('.actions') || btn.closest('.meta') || btn.closest('.product');
    if(actions){
      const qInput = actions.querySelector('.qty-input');
      if(qInput) qty = Math.max(1, parseInt(qInput.value||1,10));
    }
    addToCart({id,name,price,qty});
    btn.textContent = 'Added ✓';
    btn.classList.add('disabled');
    btn.setAttribute('aria-pressed','true');
    setTimeout(()=>{ btn.textContent = 'Add to cart'; btn.classList.remove('disabled'); btn.removeAttribute('aria-pressed'); }, 1500);
  }

  /* Cart UI: update count and render dropdown */
  function updateCartCount(){
    const cart = readCart();
    const totalCount = cart.reduce((s,it)=> s + (Number(it.qty)||0), 0);
    const count = String(totalCount || 0);
    const countEl = document.getElementById('cart-count'); if(countEl) countEl.textContent = count;
    const gCount = document.getElementById('global-cart-count'); if(gCount) gCount.textContent = count;
  }

  function renderCartDropdown(){
    renderCartTo('cart-items');
  }

    function renderCartTo(listId){
    const list = document.getElementById(listId);
    if(!list) return;
    const cart = readCart();
    list.innerHTML = '';
    if(cart.length === 0){
      const li = document.createElement('li');
      li.textContent = 'Cart is empty';
      li.style.padding = '8px 4px';
      list.appendChild(li);
      return;
    }
    // render each item with qty
    cart.slice().reverse().forEach(item=>{
      const li = document.createElement('li');
      li.innerHTML = '<span>'+ (item.name||'Product') + ' — $' + (Number(item.price)||0).toFixed(2) + '</span> <span style="float:right">Qty: '+(item.qty||0)+'</span>';
      list.appendChild(li);
    });
  }
  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.add-to-cart').forEach(b=> b.addEventListener('click', function(ev){ ev.preventDefault(); handleClick(ev); }));

    updateCartCount();

    const cartButton = document.getElementById('cart-button');
    const cartDropdown = document.getElementById('cart-dropdown');
    const globalCartBtn = document.getElementById('global-cart-button');
    const globalCartDropdown = document.getElementById('global-cart-dropdown');

    if(cartButton && cartDropdown){
      cartButton.addEventListener('click', function(e){
        const open = cartDropdown.hasAttribute('hidden');
        if(open){ renderCartTo('cart-items'); cartDropdown.removeAttribute('hidden'); cartButton.setAttribute('aria-expanded','true'); }
        else { cartDropdown.setAttribute('hidden',''); cartButton.setAttribute('aria-expanded','false'); }
      });

      document.addEventListener('click', function(ev){
        if(!cartDropdown.contains(ev.target) && !cartButton.contains(ev.target)){
          cartDropdown.setAttribute('hidden',''); cartButton.setAttribute('aria-expanded','false');
        }
      });
    }

    if(globalCartBtn && globalCartDropdown){
      globalCartBtn.addEventListener('click', function(e){
        e.stopPropagation();
        const open = globalCartDropdown.hasAttribute('hidden');
        if(open){ renderCartTo('global-cart-items'); globalCartDropdown.removeAttribute('hidden'); }
        else { globalCartDropdown.setAttribute('hidden',''); }
      });

      document.addEventListener('click', function(ev){
        if(!globalCartDropdown.contains(ev.target) && !globalCartBtn.contains(ev.target)){
          globalCartDropdown.setAttribute('hidden','');
        }
      });
    }
  });
})();
