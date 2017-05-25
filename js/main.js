
$(function(){
    var add_sheet = function(){
        var template_sheet = $('.tab-pane.template').clone();
        var sheet_num = ($('.tab-content').find('.tab-pane:not(.template)').length + 1);
        var sheet_id = 'sheet-' + sheet_num;
        template_sheet.attr('id', sheet_id);
        template_sheet.addClass('active');
        template_sheet.removeClass('template');
        $('.tab-content > div').removeClass('active');
        $('.tab-content').append(template_sheet);
        
        $('.nav-tabs .active').removeClass('active');
        $('.nav-tabs').append($('<li class="active"><a href="#'+ sheet_id +'" data-toggle="tab">Sheet ' + sheet_num + '</a></li>'));
        
        var sheet = $('.tab-content .tab-pane.active');
        add_row(sheet);
        
        sheet.find("tbody").sortable();
        
        return sheet;
    };
    var add_row = function(sheet){
        if (sheet === undefined){
            var sheet = $('.tab-content .tab-pane.active');
        }
        $(sheet).find('table').each(function(){
            var template_row = $(this).find('.template').clone();
            template_row.removeClass('template');
            template_row.find("select").selectpicker();
            
            $(this).find('tbody').append(template_row);
        });
        $(this).find("tbody").sortable('refresh');
    };
    var delete_row = function(elem){
        $(elem).parents('tr').remove();
    };
    
    var add_orderValue = function(sheet){
        if (sheet === undefined){
            var sheet = $('.tab-content .tab-pane.active');
        }
        var list = [];
        $.each(sheet.find('.ui-sortable').find('tr:not(.template)'), function () {
            var tr = $(this);
            var trOrderValue = 0;
            var sumCells = 0;
            $.each(tr.find('td.xs:not(.padding-top)'), function () {
                var input = $(this).children();
                var col = input.attr('col');
                var text = input.val();
               
                /* atribui order value */
                var columnValue = TranslateColumns(col);
                trOrderValue += (columnValue * text);
                if(text != "")
                    sumCells += parseInt(text);
            });
            if(list.indexOf(trOrderValue) < 0)
                list.push(trOrderValue / sumCells);
            
            $(this).attr('order-value', (trOrderValue / sumCells));
        });
        list.sort(compareNumbers);
        for(var e in list){
            var element = list[e];
            var index = list.indexOf(element);
            
            /*em vez de varrer a lista toda, faz get logo pelo atributo*/
            var tr = $('tr[order-value="'+ element +'"]:not(.template)');
            $.each(tr, function() {
                $(this).attr('order-value', index + 1); 
            });
        }
        tinysort('#' + sheet.attr('id') + ' tbody>tr:not(.template)', {attr:'order-value'}).forEach(function(elm,i){
            setTimeout((function(elm, i){
                elm.style.top = i * 35 + 'px';
            }).bind(null, elm, i), 40);
        });
    };
    
    var compareNumbers = function(a, b){
        return b - a;
    };
    
    var TranslateColumns = function(col){
        switch(col){
            case "G":
                return -6;
                break;
            case "H":
                return -5;
                break;
            case "I":
                return -4;
                break;
            case "J":
                return -3;
                break;
            case "K":
                return -2;
                break;
            case "L":
                return -1;
                break;
            case "M":
                return 0;
                break;   
            case "N":
                return 1;
                break;
            case "O":
                return 2;
                break;
            case "P":
                return 3;
                break;   
            case "Q":
                return 4;
                break;
            case "R":
                return 5;
                break;
            case "S":
                return 6;
                break;   
        }
    };
    
    var get_sheet_data = function(sheet){
        var data_sheet = {};
        
        data_sheet.num_rows = 0;
        data_sheet.name = $('a[href=#'+ $(sheet).attr('id') + ']').html();
        $(sheet).find('table tbody tr:not(.template)').each(function(){
            var index_start = parseInt($(this).parents('table').attr('index-start'));
            var tr_index = ($(this).index() * 2);
            
            $(this).find('input, select').each(function(){
              var col = $(this).attr('col');
              
              if($(this).attr('index-start') !== undefined){
                  index_start = parseInt($(this).attr('index-start'));
              }
              var index = index_start + tr_index;
              
              data_sheet[col + index] = $(this).val();
              
            });
            data_sheet.num_rows = $(this).index();
        });
        
        return data_sheet;
    };
    var get_data = function(){
        var data = [];
        
        $('.tab-content .tab-pane:not(.template)').each(function() {
            data.push(get_sheet_data($(this)));
        });
        
        return data;
    };
    var send_data = function(data){
        delete data.num_rows;
        
        $.ajax({
          type: 'POST',
          dataType: 'json',
          url: 'export.php',
          data: {
              cells: data
          },
          success: function(res){
              if (res.success){
                  window.location = res.file;
              }
          }
        });
    };
    var load_data = function(){
        //var _data = Cookies.get('data');
        var _data = window.localStorage.getItem('data');
        if (_data === undefined)
            return false;
        
        var data = JSON.parse(_data);
        
        $.each(data, function(i, v){
            if (i == 0){
                var sheet = $('.tab-content .tab-pane.active');
            } else {
                var sheet = add_sheet();
            }
            $('a[href=#'+ $(sheet).attr('id') + ']').html(this.name);
            
            for (i = 1; i < this.num_rows; i++) { 
                add_row(sheet);
            }
            $(sheet).find('table tbody tr').each(function(){
                var index_start = parseInt($(this).parents('table').attr('index-start'));
                var tr_index = ($(this).index() * 2);
                
                $(this).find('input, select').each(function(){
                  var col = $(this).attr('col');
                  if($(this).attr('index-start') !== undefined){
                      index_start = parseInt($(this).attr('index-start'));
                  }
                  var index = index_start + tr_index;
                  
                  $(this).attr('tmp-col', col + index);
                  
                });
            });
            $.each(this, function(k, v){
                if($.isArray(v)) {
                    $(sheet).find(':input[tmp-col=' + k + ']').selectpicker('val', v);
                } else {
                    $(sheet).find(':input[tmp-col=' + k + ']').val(v);
                }
            });
            $(sheet).find(':input[tmp-col]').removeAttr('tmp-col');
        });
        
    };
    
    $('body').on('click', '[data-action=add-row]', function(){
        add_row();
    });
    
    $('body').on('click', '[data-action=del-row]', function(){
        delete_row($(this));
    });
    
    $('body').on('click', '[data-action=export]', function(){
        var sheet = $('.tab-content .tab-pane.active');
        var data = get_sheet_data(sheet);
        send_data(data);
    });
    
    $('body').on('click', '[data-action=add-sheet]', function(){
        add_sheet();
    });
    
    $('body').on('click', '[data-action=add-orderValue]', function(){
        add_orderValue();
    });
    $('body').on('dblclick', '.nav-tabs a:not(.on-change)', function(){
        var name = $(this).html();
        $(this).html('');
        $(this).append($('<input type="text" value="' + name + '"/>'));
        $(this).addClass('on-change');
        $(this).find('input').focus();
    });
    $('body').on('keypress', '.nav-tabs a.on-change input', function(e){
        if(e.which == 13) {
            var sheet_name = $(this).val();
            $(this).parent().removeClass('on-change');
            $(this).parent().html(sheet_name);
        }
    });
    
    add_sheet();
    load_data();
    setInterval(function(){
        var data = get_data();
        
        window.localStorage.setItem('data', JSON.stringify(data));
    }, 5000);
});